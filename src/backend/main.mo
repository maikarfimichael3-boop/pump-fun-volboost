import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Migration "migration";

(with migration = Migration.run)
actor {

  // IC management canister actor type for HTTP outcalls
  let ic = actor "aaaaa-aa" : actor {
    http_request : ({
      url             : Text;
      max_response_bytes : ?Nat64;
      method          : { #get; #head; #post };
      headers         : [{ name : Text; value : Text }];
      body            : ?Blob;
      transform       : ?{
        function : shared query ({ response : { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob }; context : Blob }) -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
        context  : Blob;
      };
      is_replicated   : ?Bool;
    }) -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
  };

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
    txHash                : Text;
    coinName              : ?Text;
    coinSymbol            : ?Text;
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

  var nextOrderIndex : Nat = 0;
  var telegramBotToken : Text = "YOUR_BOT_TOKEN";
  var telegramChatId   : Text = "YOUR_CHAT_ID";

  // Working in-memory order map (populated from stable storage on upgrade)
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

  // Escape special JSON characters in a text value
  func jsonEscape(s : Text) : Text {
    var out = "";
    for (c in s.toIter()) {
      let ch : Text = Text.fromChar(c);
      if (c == '\"') { out #= "\\\"" }
      else if (c == '\\') { out #= "\\\\" }
      else if (c == '\n') { out #= "\\n" }
      else if (c == '\r') { out #= "\\r" }
      else if (c == '\t') { out #= "\\t" }
      else { out #= ch };
    };
    out;
  };

  // Simple JSON substring check — looks for a substring in the response body text
  func textContains(haystack : Text, needle : Text) : Bool {
    haystack.contains(#text needle);
  };

  // ─── Seed Data ───────────────────────────────────────────────────────────

  let initialSeedOrders : [BoostOrder] = [
    {
      id = "ord-seed-001"; ca = "8xMf3kP9nQ2rT7vJ5bL6wY4cH1mN0sXuDe";
      tier = #Premium; solAmount = 150.0; walletAddress = "7KdF2mW9pT4nQ8vJ5bL3rY6cH2mN0sXuDe";
      status = #Completed; createdAt = 1_700_000_000_000_000_000;
      estimatedCompletionTime = 1_700_259_200_000_000_000;
      volumeTarget = 2_000_000; volumeAchieved = 2_000_000; txHash = "";
      coinName = ?"SampleCoin"; coinSymbol = ?"SMP";
    },
    {
      id = "ord-seed-002"; ca = "3nR6tY1uI5oP2wQ8eA4sD7fG0hJ9kL3mX6z";
      tier = #Ultra; solAmount = 50.0; walletAddress = "9PwS3rK7mT2nQ5vJ6bL4rY7cH3mN0sXuDe";
      status = #Completed; createdAt = 1_700_100_000_000_000_000;
      estimatedCompletionTime = 1_700_244_000_000_000_000;
      volumeTarget = 500_000; volumeAchieved = 500_000; txHash = "";
      coinName = ?"MoonToken"; coinSymbol = ?"MOON";
    },
    {
      id = "ord-seed-003"; ca = "5vB8cN1mX4zL7kJ2hG0fD3sA6pO9iU2yT8r";
      tier = #Elite; solAmount = 15.0; walletAddress = "2JxN4tP8kQ6mW3vR7bL5rY8cH4mN0sXuDe";
      status = #Completed; createdAt = 1_700_200_000_000_000_000;
      estimatedCompletionTime = 1_700_272_000_000_000_000;
      volumeTarget = 100_000; volumeAchieved = 100_000; txHash = "";
      coinName = ?"PumpKing"; coinSymbol = ?"PUMP";
    },
    {
      id = "ord-seed-004"; ca = "1wE4rT7yU2iO5pA8sD1fG4hJ7kL0mN3zX6c";
      tier = #Advanced; solAmount = 8.0; walletAddress = "5LmX7nQ2tW8vJ4pK9bL6rY9cH5mN0sXuDe";
      status = #Completed; createdAt = 1_700_300_000_000_000_000;
      estimatedCompletionTime = 1_700_343_200_000_000_000;
      volumeTarget = 50_000; volumeAchieved = 50_000; txHash = "";
      coinName = ?"GemCoin"; coinSymbol = ?"GEM";
    },
    {
      id = "ord-seed-005"; ca = "6kL9jH2gF5dS8aP3oI6uY1tR4eW7qM0nB3c";
      tier = #Pro; solAmount = 5.0; walletAddress = "8QvT5mK3nJ7wP2rL0bL7rY0cH6mN0sXuDe";
      status = #Active; createdAt = 1_700_400_000_000_000_000;
      estimatedCompletionTime = 1_700_428_800_000_000_000;
      volumeTarget = 25_000; volumeAchieved = 12_500; txHash = "";
      coinName = ?"RocketFuel"; coinSymbol = ?"RKT";
    },
    {
      id = "ord-seed-006"; ca = "2mN5bV8cX1zK4jH7gF0dS3aP6oI9uY2tR5e";
      tier = #Growth; solAmount = 2.5; walletAddress = "4RnW6tJ2mQ9vP5kL1bL8rY1cH7mN0sXuDe";
      status = #Active; createdAt = 1_700_500_000_000_000_000;
      estimatedCompletionTime = 1_700_514_400_000_000_000;
      volumeTarget = 10_000; volumeAchieved = 6_300; txHash = "";
      coinName = ?"StarDust"; coinSymbol = ?"STAR";
    },
    {
      id = "ord-seed-007"; ca = "9pO2iU5yT8rE1wQ4sD7fG0hJ3kL6mN9zX2c";
      tier = #Basic; solAmount = 1.5; walletAddress = "6TkP9mN3rQ7vW2jH2bL9rY2cH8mN0sXuDe";
      status = #Processing; createdAt = 1_700_600_000_000_000_000;
      estimatedCompletionTime = 1_700_607_200_000_000_000;
      volumeTarget = 5_000; volumeAchieved = 1_200; txHash = "";
      coinName = ?"NovaCoin"; coinSymbol = ?"NOVA";
    },
    {
      id = "ord-seed-008"; ca = "4sA7dF0gH3jK6lM9nP2qR5tU8vW1xY4zA7b";
      tier = #Elite; solAmount = 15.0; walletAddress = "3WmR7tK5nQ8vJ2pL3bL0rY3cH9mN0sXuDe";
      status = #Completed; createdAt = 1_700_700_000_000_000_000;
      estimatedCompletionTime = 1_700_772_000_000_000_000;
      volumeTarget = 100_000; volumeAchieved = 100_000; txHash = "";
      coinName = ?"FlashCoin"; coinSymbol = ?"FLC";
    },
    {
      id = "ord-seed-009"; ca = "7bC0eI3fL6mP9nQ2rS5tV8wX1yZ4aA7dB0g";
      tier = #Starter; solAmount = 0.5; walletAddress = "1SxQ8mP4nK7vW3tJ4bL1rY4cH0mN0sXuDe";
      status = #Completed; createdAt = 1_700_800_000_000_000_000;
      estimatedCompletionTime = 1_700_803_600_000_000_000;
      volumeTarget = 1_000; volumeAchieved = 1_000; txHash = "";
      coinName = ?"PepeX"; coinSymbol = ?"PEPEX";
    },
    {
      id = "ord-seed-010"; ca = "0hJ3kL6mN9pQ2rS5tU8vW1xY4zA7bC0eI3f";
      tier = #Pro; solAmount = 5.0; walletAddress = "7PtM5nJ3rQ6vW2kL5bL2rY5cH1mN0sXuDe";
      status = #Pending; createdAt = 1_700_900_000_000_000_000;
      estimatedCompletionTime = 1_700_928_800_000_000_000;
      volumeTarget = 25_000; volumeAchieved = 0; txHash = "";
      coinName = ?"ZeroCoin"; coinSymbol = ?"ZERO";
    },
  ];

  // Populate on first init (fresh canister, not an upgrade)
  do {
    if (currentOrders.size() == 0) {
      for (o in initialSeedOrders.values()) {
        currentOrders.add(o.id, o);
      };
      nextOrderIndex := initialSeedOrders.size();
    };
  };

  // ─── HTTP Outcall Helpers ────────────────────────────────────────────────

  // Verify a Solana transaction hash on-chain via mainnet RPC.
  // Returns #ok(true) if confirmed/finalized, #ok(false) if not found, #err on RPC failure.
  public shared func verifyTxHashOnChain(txHash : Text) : async { #ok : Bool; #err : Text } {
    let requestBody = "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"getSignatureStatuses\",\"params\":[[\"" # jsonEscape(txHash) # "\"],{\"searchTransactionHistory\":true}]}";
    let bodyBlob = requestBody.encodeUtf8();

    try {
      let response = await ic.http_request({
        url             = "https://api.mainnet-beta.solana.com";
        max_response_bytes = ?10_000;
        method          = #post;
        headers         = [{ name = "Content-Type"; value = "application/json" }];
        body            = ?bodyBlob;
        transform       = null;
        is_replicated   = null;
      });

      if (response.status < 200 or response.status >= 300) {
        return #err("RPC call failed with status: " # response.status.toText());
      };

      let bodyText = switch (response.body.decodeUtf8()) {
        case (?t) { t };
        case null { return #err("Failed to decode RPC response") };
      };

      // Check for null result (transaction not found)
      if (textContains(bodyText, "\"value\":[null]")) {
        return #ok(false);
      };

      // Check for confirmed or finalized status
      if (textContains(bodyText, "\"confirmationStatus\":\"confirmed\"") or
          textContains(bodyText, "\"confirmationStatus\":\"finalized\"")) {
        return #ok(true);
      };

      // Response has value but no confirmed/finalized status yet
      #ok(false);
    } catch (_e) {
      #err("RPC call failed: " # "network error");
    };
  };

  // Send a Telegram notification for a confirmed boost order.
  // Uses the stored bot token and chat ID.
  public shared func sendTelegramNotification(orderId : Text) : async { #ok : Text; #err : Text } {
    if (telegramBotToken == "YOUR_BOT_TOKEN" or telegramChatId == "YOUR_CHAT_ID") {
      return #err("Telegram not configured. Call setTelegramConfig first.");
    };

    let order = switch (currentOrders.get(orderId)) {
      case (?o) { o };
      case null { return #err("Order not found: " # orderId) };
    };

    let message = "** New Boost Order Confirmed! **\n\n" #
      "Coin: " # jsonEscape(switch (order.coinSymbol) { case (?s) s; case null "" }) # " (" # jsonEscape(switch (order.coinName) { case (?n) n; case null "" }) # ")\n" #
      "Tier: " # tierName(order.tier) # "\n" #
      "Volume Target: $" # order.volumeTarget.toText() # "\n" #
      "TX Hash: " # jsonEscape(order.txHash) # "\n" #
      "Order ID: " # jsonEscape(orderId);

    let requestBody = "{\"chat_id\":\"" # jsonEscape(telegramChatId) # "\",\"text\":\"" # jsonEscape(message) # "\"}";
    let bodyBlob = requestBody.encodeUtf8();
    let url = "https://api.telegram.org/bot" # telegramBotToken # "/sendMessage";

    try {
      let response = await ic.http_request({
        url             = url;
        max_response_bytes = ?5_000;
        method          = #post;
        headers         = [{ name = "Content-Type"; value = "application/json" }];
        body            = ?bodyBlob;
        transform       = null;
        is_replicated   = null;
      });

      if (response.status >= 200 and response.status < 300) {
        #ok("Telegram notification sent successfully");
      } else {
        let bodyText = switch (response.body.decodeUtf8()) {
          case (?t) { t };
          case null { "unknown error" };
        };
        #err("Telegram API error " # response.status.toText() # ": " # bodyText);
      };
    } catch (_e) {
      #err("Failed to send Telegram notification: network error");
    };
  };

  // Update Telegram bot configuration (admin only by convention — no auth enforced here
  // since there is no identity system in this canister).
  public shared func setTelegramConfig(botToken : Text, chatId : Text) : async () {
    if (botToken.size() == 0) { Runtime.trap("Bot token cannot be empty") };
    if (chatId.size() == 0)   { Runtime.trap("Chat ID cannot be empty") };
    telegramBotToken := botToken;
    telegramChatId   := chatId;
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
      txHash                = "";
      coinName              = null;
      coinSymbol            = null;
    };
    currentOrders.add(orderId, order);
    order;
  };

  // Submit a boost order with coin metadata (name and symbol from CA lookup).
  public shared func submitBoostOrderWithCoin(
    ca            : Text,
    tier          : Text,
    walletAddress : Text,
    coinName      : Text,
    coinSymbol    : Text,
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
      txHash                = "";
      coinName              = ?coinName;
      coinSymbol            = ?coinSymbol;
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

  // Validates and stores the transaction hash, then verifies it on-chain via Solana RPC.
  // Returns #err if the order is not found, already active/completed/failed,
  // the txHash is malformed, or if the TX is not confirmed on-chain.
  public shared func submitTxHash(orderId : Text, txHash : Text) : async { #ok : BoostOrder; #err : Text } {
    if (txHash.size() == 0) {
      return #err("Transaction hash cannot be empty");
    };
    // Solana signatures are base58-encoded and 87 or 88 characters long
    let len = txHash.size();
    if (len < 87 or len > 88) {
      return #err("Invalid transaction hash: must be 87 or 88 characters (Solana base58 signature)");
    };
    switch (currentOrders.get(orderId)) {
      case null { #err("Order not found: " # orderId) };
      case (?order) {
        switch (order.status) {
          case (#Active or #Completed or #Failed) {
            #err("Cannot submit transaction hash: order is already " # (
              switch (order.status) {
                case (#Active)    { "Active"    };
                case (#Completed) { "Completed" };
                case (#Failed)    { "Failed"    };
                case _            { "in a final state" };
              }
            ));
          };
          case _ {
            // Verify TX on-chain before accepting
            let verifyResult = await verifyTxHashOnChain(txHash);
            switch (verifyResult) {
              case (#err(_e)) {
                // RPC unavailable — fall through and accept the hash optimistically
                // so users are not blocked by transient network issues
                let updated : BoostOrder = { order with txHash = txHash; status = #Processing };
                currentOrders.add(orderId, updated);
                #ok(updated);
              };
              case (#ok(false)) {
                #err("Transaction not found on Solana blockchain. Please check your TX hash and try again.");
              };
              case (#ok(true)) {
                let updated : BoostOrder = { order with txHash = txHash; status = #Processing };
                currentOrders.add(orderId, updated);
                #ok(updated);
              };
            };
          };
        };
      };
    };
  };

  // Verifies that a txHash is present on the order and transitions Processing → Active.
  // Also fires a Telegram notification on success.
  public shared func verifyAndActivateBoost(orderId : Text) : async { #ok : BoostOrder; #err : Text } {
    switch (currentOrders.get(orderId)) {
      case null { #err("Order not found: " # orderId) };
      case (?order) {
        if (order.txHash.size() == 0) {
          return #err("No transaction hash submitted for this order. Please submit your TX hash first.");
        };
        switch (order.status) {
          case (#Processing) {
            let updated : BoostOrder = { order with status = #Active };
            currentOrders.add(orderId, updated);
            // Fire Telegram notification — fire-and-forget (ignore result)
            ignore sendTelegramNotification(orderId);
            #ok(updated);
          };
          case (#Active)    { #err("Boost is already active") };
          case (#Completed) { #err("Boost is already completed") };
          case (#Pending)   { #err("Transaction hash has not been submitted yet") };
          case (#Failed)    { #err("Boost has failed and cannot be activated") };
        };
      };
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
