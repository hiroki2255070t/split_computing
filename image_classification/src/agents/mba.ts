// --- 1. 状態を定義する型 ---

/** 個々の腕（アーム）の状態 */
type ArmState = {
  readonly count: number; // この腕が引かれた回数
  readonly value: number; // この腕から得られた報酬の合計
};

/** バンディット全体の現在の状態 */
type BanditState = {
  readonly arms: readonly ArmState[]; // 全てのアームの状態の配列
  readonly totalPulls: number; // 全てのアームが引かれた総回数
};

// --- 2. 状態を操作する純粋関数 ---

/**
 * バンディットの初期状態を生成する関数
 * @param n_arms - 腕の数
 * @returns {BanditState} 初期化されたバンディットの状態
 */
const createBandit = (n_arms: number): BanditState => {
  return {
    arms: Array(n_arms).fill({ count: 0, value: 0 }),
    totalPulls: 0,
  };
};

/**
 * 現在の状態に基づき、次に引くべき腕を選択する純粋関数
 * @param state - バンディットの現在の状態
 * @returns {number} 選択された腕のインデックス
 */
const selectArm = (state: BanditState): number => {
  // ステップ1: まず、全ての腕を少なくとも1回ずつ引く
  const unpulledArmIndex = state.arms.findIndex((arm) => arm.count === 0);
  if (unpulledArmIndex !== -1) {
    return unpulledArmIndex;
  }

  // ステップ2: 全ての腕のUCBスコアを計算し、最大スコアの腕を選択
  const ucbScores = state.arms.map((arm) => {
    const averageReward = arm.value / arm.count;
    const confidenceBound = Math.sqrt((2 * Math.log(state.totalPulls)) / arm.count);
    return averageReward + confidenceBound;
  });

  // UCBスコアが最大の腕のインデックスを返す
  return ucbScores.indexOf(Math.max(...ucbScores));
};

/**
 * 腕を引いた結果を反映した「新しい」状態を返す純粋関数
 * @param state - 更新前の状態
 * @param armIndex - 更新する腕のインデックス
 * @param reward - 得られた報酬
 * @returns {BanditState} 更新後の新しい状態
 */
const updateBandit = (state: BanditState, armIndex: number, reward: number): BanditState => {
  // 元の`arms`配列を直接変更せず、新しい配列を作成する
  const newArms = state.arms.map((arm, index) => {
    if (index === armIndex) {
      // 更新対象の腕だけ、新しいオブジェクトを返す
      return {
        count: arm.count + 1,
        value: arm.value + reward,
      };
    }
    // それ以外の腕は元のオブジェクトをそのまま使う
    return arm;
  });

  // 新しいarms配列と更新されたtotalPullsを持つ、新しいStateオブジェクトを返す
  return {
    arms: newArms,
    totalPulls: state.totalPulls + 1,
  };
};

// --- 3. シミュレーション（ここが状態を変化させる唯一の場所） ---

const runSimulation = () => {
  // 各腕の「真の」成功確率（アルゴリズムはこれを知らない）
  const trueProbabilities = [0.2, 0.5, 0.9, 0.75];
  const N_ARMS = trueProbabilities.length;
  const N_ROUNDS = 1000;

  // `let`で再代入可能な変数として状態を保持
  let banditState: BanditState = createBandit(N_ARMS);

  console.log(`Starting simulation with ${N_ARMS} arms for ${N_ROUNDS} rounds.`);
  console.log(`True probabilities: [${trueProbabilities.join(', ')}]\n`);

  for (let i = 0; i < N_ROUNDS; i++) {
    // 1. 現在の状態から腕を選択
    const chosenArm = selectArm(banditState);

    // 2. 報酬をシミュレート
    const reward = Math.random() < trueProbabilities[chosenArm] ? 1 : 0;

    // 3. update関数を呼び出し、新しい状態を現在の状態に再代入
    banditState = updateBandit(banditState, chosenArm, reward);
  }

  // --- 最終結果の表示 ---
  console.log('--- Final Result ---');
  banditState.arms.forEach((arm, index) => {
    const average = arm.count > 0 ? arm.value / arm.count : 0;
    console.log(`Arm #${index}: Pulled ${arm.count} times, Average Reward: ${average.toFixed(3)}`);
  });
  console.log(`Total Pulls: ${banditState.totalPulls}`);
  console.log('---------------------\n');
};

// シミュレーションを実行
runSimulation();
