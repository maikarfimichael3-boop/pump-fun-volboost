import Map "mo:core/Map";

module {
  // ─── Old types (as deployed — without coinName/coinSymbol) ───────────────

  type OldBoostTier = {
    #Starter; #Basic; #Growth; #Pro; #Advanced; #Elite; #Ultra; #Premium;
  };

  type OldBoostStatus = {
    #Pending; #Processing; #Active; #Completed; #Failed;
  };

  type OldBoostOrder = {
    id                    : Text;
    ca                    : Text;
    tier                  : OldBoostTier;
    solAmount             : Float;
    walletAddress         : Text;
    status                : OldBoostStatus;
    createdAt             : Int;
    estimatedCompletionTime : Int;
    volumeTarget          : Nat;
    volumeAchieved        : Nat;
    txHash                : Text;
  };

  // ─── New types ───────────────────────────────────────────────────────────

  type NewBoostTier = {
    #Starter; #Basic; #Growth; #Pro; #Advanced; #Elite; #Ultra; #Premium;
  };

  type NewBoostStatus = {
    #Pending; #Processing; #Active; #Completed; #Failed;
  };

  type NewBoostOrder = {
    id                    : Text;
    ca                    : Text;
    tier                  : NewBoostTier;
    solAmount             : Float;
    walletAddress         : Text;
    status                : NewBoostStatus;
    createdAt             : Int;
    estimatedCompletionTime : Int;
    volumeTarget          : Nat;
    volumeAchieved        : Nat;
    txHash                : Text;
    coinName              : ?Text;
    coinSymbol            : ?Text;
  };

  // ─── Migration input/output actor types ──────────────────────────────────

  type OldActor = {
    currentOrders     : Map.Map<Text, OldBoostOrder>;
    initialSeedOrders : [OldBoostOrder];
    var nextOrderIndex  : Nat;
    var stableOrders    : [(Text, OldBoostOrder)];
  };

  type NewActor = {
    currentOrders     : Map.Map<Text, NewBoostOrder>;
    initialSeedOrders : [NewBoostOrder];
    var nextOrderIndex  : Nat;
    var telegramBotToken : Text;
    var telegramChatId   : Text;
  };

  // ─── Migration function ──────────────────────────────────────────────────

  func migrateOrder(old : OldBoostOrder) : NewBoostOrder {
    { old with coinName = null; coinSymbol = null }
  };

  public func run(old : OldActor) : NewActor {
    let newCurrentOrders = old.currentOrders.map<Text, OldBoostOrder, NewBoostOrder>(
      func(_k, o) { migrateOrder(o) }
    );
    let newInitialSeedOrders = old.initialSeedOrders.map(
      func(o : OldBoostOrder) : NewBoostOrder { migrateOrder(o) }
    );
    // Consume stableOrders to explicitly drop it (it was the classical-persistence staging area)
    ignore old.stableOrders;
    {
      currentOrders     = newCurrentOrders;
      initialSeedOrders = newInitialSeedOrders;
      var nextOrderIndex  = old.nextOrderIndex;
      var telegramBotToken = "YOUR_BOT_TOKEN";
      var telegramChatId   = "YOUR_CHAT_ID";
    }
  };
};
