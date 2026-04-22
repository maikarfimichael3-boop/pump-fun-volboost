import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";



actor {

  // ─── Types ───────────────────────────────────────────────────────────────

  type BoostTier = {
    #Starter;   // $1K, 0.5 SOL
    #Basic;     // $5K, 1.5 SOL
    #Growth;    // $10K, 2.5 SOL
    #Pro;       // $25K, 5 SOL
    #Advanced;  // $50K, 8 SOL
    #Elite;     // $100K, 15 SOL
    #Ultra;     // $500K, 50 SOL
    #Premium;   // $2M, 150 SOL
  };

  type BoostStatus = {
    #Pending;
    #Processing;
    #Active;
    #Completed;
    #Failed;
  };

  type BoostOrder = {
    id                    : Text;
    ca                    : Text;
    tier                  : BoostTier;
    solAmount             : Float;
    walletAddress         : Text;
    status                : BoostStatus;
    createdAt             : Int;
    estimatedCompletionTime : Int;
    volumeTarget          : Nat;
    volumeAchieved        : Nat;
  };

  type BoostProgress = {
    orderId        : Text;
    percentComplete : Nat;
    volumeAchieved : Nat;
    volumeTarget   : Nat;
    status         : BoostStatus;
    timeRemaining  : Int;
  };

  type LeaderboardEntry = {
    rank          : Nat;
    walletAddress : Text;
    totalVolume   : Nat;
    totalOrders   : Nat;
    displayWallet : Text;
  };

  type TierInfo = {
    name            : Text;
    tier            : BoostTier;
    dollarTarget    : Nat;
    solCost         : Float;
    estimatedHours  : Nat;
  };

  // ─── State ───────────────────────────────────────────────────────────────

  // Stable counter — survives upgrades. Migration sets this from old actor's nextOrderIndex.
  var nextOrderIndex : Nat = 0;

  // Working in-memory order map (populated from seed on fresh deploy; re-seeded on upgrade)
  let currentOrders : Map.Map<Text, BoostOrder> = Map.empty<Text, BoostOrder>();

  // ─── Tier Helpers ────────────────────────────────────────────────────────

  func tierSolCost(tier : BoostTier) : Float {
    switch tier {
      case (#Starter)  { 0.5   };
      case (#Basic)    { 1.5   };
      case (#Growth)   { 2.5   };
      case (#Pro)      { 5.0   };
      case (#Advanced) { 8.0   };
      case (#Elite)    { 15.0  };
      case (#Ultra)    { 50.0  };
      case (#Premium)  { 150.0 };
    };
  };

  func tierVolumeTarget(tier : BoostTier) : Nat {
    switch tier {
      case (#Starter)  { 1_000     };
      case (#Basic)    { 5_000     };
      case (#Growth)   { 10_000    };
      case (#Pro)      { 25_000    };
      case (#Advanced) { 50_000    };
      case (#Elite)    { 100_000   };
      case (#Ultra)    { 500_000   };
      case (#Premium)  { 2_000_000 };
    };
  };

  // Duration in seconds for progress simulation
  func tierDurationSecs(tier : BoostTier) : Int {
    switch tier {
      case (#Starter)  { 3_600   };   // 1h
      case (#Basic)    { 7_200   };   // 2h
      case (#Growth)   { 14_400  };   // 4h
      case (#Pro)      { 28_800  };   // 8h
      case (#Advanced) { 43_200  };   // 12h
      case (#Elite)    { 72_000  };   // 20h
      case (#Ultra)    { 144_000 };   // 40h
      case (#Premium)  { 259_200 };   // 72h
    };
  };

  func tierName(tier : BoostTier) : Text {
    switch tier {
      case (#Starter)  { "Starter"  };
      case (#Basic)    { "Basic"    };
      case (#Growth)   { "Growth"   };
      case (#Pro)      { "Pro"      };
      case (#Advanced) { "Advanced" };
      case (#Elite)    { "Elite"    };
      case (#Ultra)    { "Ultra"    };
      case (#Premium)  { "Premium"  };
    };
  };

  func parseTier(t : Text) : BoostTier {
    switch t {
      case "Starter"  { #Starter  };
      case "Basic"    { #Basic    };
      case "Growth"   { #Growth   };
      case "Pro"      { #Pro      };
      case "Advanced" { #Advanced };
      case "Elite"    { #Elite    };
      case "Ultra"    { #Ultra    };
      case "Premium"  { #Premium  };
      case _          { Runtime.trap("Invalid tier: " # t) };
    };
  };

  // ─── Progress Helpers ────────────────────────────────────────────────────

  // Compute volumeAchieved and percentComplete from elapsed time
  func computeProgress(order : BoostOrder) : (Nat, Nat, Int) {
    switch (order.status) {
      case (#Completed) { (order.volumeTarget, 100, 0) };
      case (#Failed)    { (0, 0, 0) };
      case (#Pending)   { (0, 0, tierDurationSecs(order.tier)) };
      case (#Processing) {
        let durationNanos : Int = tierDurationSecs(order.tier) * 1_000_000_000;
        let elapsed       : Int = Time.now() - order.createdAt;
        let clamped       : Int = Int.min(elapsed, durationNanos);
        let pct           : Nat = Int.abs(clamped * 100 / durationNanos);
        let vol           : Nat = order.volumeTarget * pct / 100;
        let remainNanos   : Int = durationNanos - clamped;
        (vol, pct, remainNanos / 1_000_000_000);
      };
      case (#Active) {
        let durationNanos : Int = tierDurationSecs(order.tier) * 1_000_000_000;
        let elapsed       : Int = Time.now() - order.createdAt;
        let clamped       : Int = Int.min(elapsed, durationNanos);
        let pct           : Nat = Int.abs(clamped * 100 / durationNanos);
        let vol           : Nat = order.volumeTarget * pct / 100;
        let remainNanos   : Int = durationNanos - clamped;
        (vol, pct, remainNanos / 1_000_000_000);
      };
    };
  };

  func nextStatus(current : BoostStatus) : BoostStatus {
    switch current {
      case (#Pending)    { #Processing };
      case (#Processing) { #Active     };
      case (#Active)     { #Completed  };
      case (#Completed)  { #Completed  };
      case (#Failed)     { #Failed     };
    };
  };

  // ─── Misc Helpers ────────────────────────────────────────────────────────

  func generateOrderId() : Text {
    let now = Time.now();
    let idx = nextOrderIndex;
    nextOrderIndex += 1;
    "ord-" # now.toText() # "-" # idx.toText();
  };

  func truncateWallet(addr : Text) : Text {
    let len = addr.size();
    if (len <= 12) { addr } else {
      let chars = addr.toArray();
      var result = "";
      var i = 0;
      for (c in chars.values()) {
        if (i < 6) { result #= Text.fromChar(c) };
        i += 1;
      };
      result #= "...";
      let startLast4 : Nat = if (len >= 4) { len - 4 } else { 0 };
      var j = 0;
      for (c in chars.values()) {
        if (j >= startLast4) { result #= Text.fromChar(c) };
        j += 1;
      };
      result;
    };
  };

  // ─── Seed Data ───────────────────────────────────────────────────────────

  let initialSeedOrders : [BoostOrder] = [
    {
      id = "ord-seed-001"; ca = "8xMf3kP9nQ2rT7vJ5bL6wY4cH1mN0sXuDe";
      tier = #Premium; solAmount = 150.0; walletAddress = "7KdF2mW9pT4nQ8vJ5bL3rY6cH2mN0sXuDe";
      status = #Completed; createdAt = 1_700_000_000_000_000_000;
      estimatedCompletionTime = 1_700_259_200_000_000_000;
      volumeTarget = 2_000_000; volumeAchieved = 2_000_000;
    },
    {
      id = "ord-seed-002"; ca = "3nR6tY1uI5oP2wQ8eA4sD7fG0hJ9kL3mX6z";
      tier = #Ultra; solAmount = 50.0; walletAddress = "9PwS3rK7mT2nQ5vJ6bL4rY7cH3mN0sXuDe";
      status = #Completed; createdAt = 1_700_100_000_000_000_000;
      estimatedCompletionTime = 1_700_244_000_000_000_000;
      volumeTarget = 500_000; volumeAchieved = 500_000;
    },
    {
      id = "ord-seed-003"; ca = "5vB8cN1mX4zL7kJ2hG0fD3sA6pO9iU2yT8r";
      tier = #Elite; solAmount = 15.0; walletAddress = "2JxN4tP8kQ6mW3vR7bL5rY8cH4mN0sXuDe";
      status = #Completed; createdAt = 1_700_200_000_000_000_000;
      estimatedCompletionTime = 1_700_272_000_000_000_000;
      volumeTarget = 100_000; volumeAchieved = 100_000;
    },
    {
      id = "ord-seed-004"; ca = "1wE4rT7yU2iO5pA8sD1fG4hJ7kL0mN3zX6c";
      tier = #Advanced; solAmount = 8.0; walletAddress = "5LmX7nQ2tW8vJ4pK9bL6rY9cH5mN0sXuDe";
      status = #Completed; createdAt = 1_700_300_000_000_000_000;
      estimatedCompletionTime = 1_700_343_200_000_000_000;
      volumeTarget = 50_000; volumeAchieved = 50_000;
    },
    {
      id = "ord-seed-005"; ca = "6kL9jH2gF5dS8aP3oI6uY1tR4eW7qM0nB3c";
      tier = #Pro; solAmount = 5.0; walletAddress = "8QvT5mK3nJ7wP2rL0bL7rY0cH6mN0sXuDe";
      status = #Active; createdAt = 1_700_400_000_000_000_000;
      estimatedCompletionTime = 1_700_428_800_000_000_000;
      volumeTarget = 25_000; volumeAchieved = 12_500;
    },
    {
      id = "ord-seed-006"; ca = "2mN5bV8cX1zK4jH7gF0dS3aP6oI9uY2tR5e";
      tier = #Growth; solAmount = 2.5; walletAddress = "4RnW6tJ2mQ9vP5kL1bL8rY1cH7mN0sXuDe";
      status = #Active; createdAt = 1_700_500_000_000_000_000;
      estimatedCompletionTime = 1_700_514_400_000_000_000;
      volumeTarget = 10_000; volumeAchieved = 6_300;
    },
    {
      id = "ord-seed-007"; ca = "9pO2iU5yT8rE1wQ4sD7fG0hJ3kL6mN9zX2c";
      tier = #Basic; solAmount = 1.5; walletAddress = "6TkP9mN3rQ7vW2jH2bL9rY2cH8mN0sXuDe";
      status = #Processing; createdAt = 1_700_600_000_000_000_000;
      estimatedCompletionTime = 1_700_607_200_000_000_000;
      volumeTarget = 5_000; volumeAchieved = 1_200;
    },
    {
      id = "ord-seed-008"; ca = "4sA7dF0gH3jK6lM9nP2qR5tU8vW1xY4zA7b";
      tier = #Elite; solAmount = 15.0; walletAddress = "3WmR7tK5nQ8vJ2pL3bL0rY3cH9mN0sXuDe";
      status = #Completed; createdAt = 1_700_700_000_000_000_000;
      estimatedCompletionTime = 1_700_772_000_000_000_000;
      volumeTarget = 100_000; volumeAchieved = 100_000;
    },
    {
      id = "ord-seed-009"; ca = "7bC0eI3fL6mP9nQ2rS5tV8wX1yZ4aA7dB0g";
      tier = #Starter; solAmount = 0.5; walletAddress = "1SxQ8mP4nK7vW3tJ4bL1rY4cH0mN0sXuDe";
      status = #Completed; createdAt = 1_700_800_000_000_000_000;
      estimatedCompletionTime = 1_700_803_600_000_000_000;
      volumeTarget = 1_000; volumeAchieved = 1_000;
    },
    {
      id = "ord-seed-010"; ca = "0hJ3kL6mN9pQ2rS5tU8vW1xY4zA7bC0eI3f";
      tier = #Pro; solAmount = 5.0; walletAddress = "7PtM5nJ3rQ6vW2kL5bL2rY5cH1mN0sXuDe";
      status = #Pending; createdAt = 1_700_900_000_000_000_000;
      estimatedCompletionTime = 1_700_928_800_000_000_000;
      volumeTarget = 25_000; volumeAchieved = 0;
    },
  ];

  // Populate seed data on fresh deploy
  do {
    for (o in initialSeedOrders.values()) {
      currentOrders.add(o.id, o);
    };
    nextOrderIndex := initialSeedOrders.size();
  };

  // ─── Public API ──────────────────────────────────────────────────────────

  public shared func submitBoostOrder(
    ca            : Text,
    tier          : Text,
    walletAddress : Text,
  ) : async BoostOrder {
    if (ca.size() == 0)            { Runtime.trap("Contract address cannot be empty") };
    if (tier.size() == 0)          { Runtime.trap("Tier cannot be empty") };
    if (walletAddress.size() == 0) { Runtime.trap("Wallet address cannot be empty") };

    let parsedTier   = parseTier(tier);
    let solAmt       = tierSolCost(parsedTier);
    let volTarget    = tierVolumeTarget(parsedTier);
    let durationSecs = tierDurationSecs(parsedTier);
    let now          = Time.now();
    let estCompletion = now + durationSecs * 1_000_000_000;
    let orderId      = generateOrderId();

    let order : BoostOrder = {
      id                    = orderId;
      ca;
      tier                  = parsedTier;
      solAmount             = solAmt;
      walletAddress;
      status                = #Pending;
      createdAt             = now;
      estimatedCompletionTime = estCompletion;
      volumeTarget          = volTarget;
      volumeAchieved        = 0;
    };
    currentOrders.add(orderId, order);
    order;
  };

  public query func getBoostOrder(orderId : Text) : async ?BoostOrder {
    currentOrders.get(orderId);
  };

  public query func getBoostOrdersByWallet(walletAddress : Text) : async [BoostOrder] {
    currentOrders.values().filter(func(o) { o.walletAddress == walletAddress }).toArray();
  };

  public shared func updateBoostStatus(orderId : Text, status : Text) : async Bool {
    let newStatus : BoostStatus = switch status {
      case "Pending"    { #Pending    };
      case "Processing" { #Processing };
      case "Active"     { #Active     };
      case "Completed"  { #Completed  };
      case "Failed"     { #Failed     };
      case _            { Runtime.trap("Invalid status: " # status) };
    };
    switch (currentOrders.get(orderId)) {
      case (?order) {
        let updated : BoostOrder = { order with status = newStatus };
        currentOrders.add(orderId, updated);
        true;
      };
      case null { false };
    };
  };

  public query func getActiveBoosts() : async [BoostOrder] {
    currentOrders.values()
      .filter(func(o) {
        switch (o.status) {
          case (#Active or #Processing) { true };
          case _                        { false };
        }
      })
      .toArray();
  };

  public query func getBoostProgress(orderId : Text) : async ?BoostProgress {
    switch (currentOrders.get(orderId)) {
      case null { null };
      case (?order) {
        let (vol, pct, rem) = computeProgress(order);
        ?{
          orderId         = orderId;
          percentComplete = pct;
          volumeAchieved  = vol;
          volumeTarget    = order.volumeTarget;
          status          = order.status;
          timeRemaining   = rem;
        };
      };
    };
  };

  public query func getLeaderboard(limit : Nat) : async [LeaderboardEntry] {
    let safeLimit = if (limit == 0) { 10 } else { Nat.min(limit, 100) };

    // Aggregate by walletAddress
    let walletMap : Map.Map<Text, (Nat, Nat)> = Map.empty<Text, (Nat, Nat)>();

    currentOrders.forEach(func(_, order) {
      let wa = order.walletAddress;
      let vol = order.volumeAchieved;
      switch (walletMap.get(wa)) {
        case (?((totalVol, totalOrds))) {
          walletMap.add(wa, (totalVol + vol, totalOrds + 1));
        };
        case null {
          walletMap.add(wa, (vol, 1));
        };
      };
    });

    // Convert to array and sort by totalVolume descending
    let entries = walletMap.entries()
      .toArray()
      .sort(func((_, (va, _)), (_, (vb, _))) {
        if (va > vb) { #less }
        else if (va < vb) { #greater }
        else { #equal }
      });

    let takeCount = Nat.min(safeLimit, entries.size());
    entries.sliceToArray(0, takeCount.toInt())
      .mapEntries<(Text, (Nat, Nat)), LeaderboardEntry>(
        func((wa, (totalVol, totalOrds)), i) {
          {
            rank          = i + 1;
            walletAddress = wa;
            totalVolume   = totalVol;
            totalOrders   = totalOrds;
            displayWallet = truncateWallet(wa);
          }
        }
      );
  };

  // Advances all Pending → Processing → Active → Completed orders
  public shared func simulateProgressUpdate() : async () {
    let now = Time.now();
    let toUpdate = List.empty<(Text, BoostOrder)>();

    currentOrders.forEach(func(id, order) {
      switch (order.status) {
        case (#Pending or #Processing or #Active) {
          let elapsed   = now - order.createdAt;
          let durNanos  = tierDurationSecs(order.tier) * 1_000_000_000;
          let newStatus = if (elapsed >= durNanos) { #Completed } else { nextStatus(order.status) };
          let (vol, _, _) = computeProgress({ order with status = newStatus });
          let updated : BoostOrder = { order with status = newStatus; volumeAchieved = vol };
          toUpdate.add((id, updated));
        };
        case _ {};
      };
    });

    toUpdate.forEach(func((id, updated)) {
      currentOrders.add(id, updated);
    });
  };

  public query func getTierInfo() : async [TierInfo] {
    let tiers : [BoostTier] = [
      #Starter, #Basic, #Growth, #Pro, #Advanced, #Elite, #Ultra, #Premium
    ];
    tiers.map<BoostTier, TierInfo>(func(t) {
      {
        name           = tierName(t);
        tier           = t;
        dollarTarget   = tierVolumeTarget(t);
        solCost        = tierSolCost(t);
        estimatedHours = Int.abs(tierDurationSecs(t)) / 3600;
      }
    });
  };
};
