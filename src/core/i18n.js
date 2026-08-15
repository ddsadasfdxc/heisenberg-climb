const ZH = {
  'The Climb — desert roguelike deckbuilder': '绝命高塔 — 沙漠卡牌构筑冒险',
  'Say my name. Build the empire. Climb the tower.': '说出我的名字。建立帝国。登上高塔。',
  'New Climb': '新的攀登', 'Continue Run': '继续游戏', 'Continue Run (empty)': '继续游戏（无存档）',
  'Wipe Save': '清除存档', 'Choose Operator': '选择角色', 'Talent passive applies for the whole run.': '天赋被动在整局游戏中生效。',
  'Back': '返回', 'Abandon': '放弃本局', 'The Climb': '高塔之路', 'Loot': '战利品', 'Skip Card': '跳过卡牌',
  'Play': '打出', 'End Turn': '结束回合', 'Select a card': '选择一张牌', 'Select a target enemy': '选择目标敌人',
  'Tap card again or Play': '再次点击卡牌或点击“打出”', 'No statuses': '无状态', 'DOWN': '倒下',
  'Desert Rest': '沙漠营地', 'Heal up, or put an edge on your deck.': '恢复伤势，或强化你的牌组。',
  'Smith (Upgrade 1 card)': '锻造（升级一张牌）', 'Smith': '锻造', 'Choose a card to upgrade.': '选择一张要升级的牌。',
  'No upgradable cards.': '没有可升级的卡牌。', 'Leave Shop': '离开商店', 'Cards': '卡牌', 'Relics': '遗物',
  "Saul's Side Hustle": '索尔的副业', 'Cards, relics, and discreet deletions.': '卡牌、遗物，以及不留痕迹的删除服务。',
  'Discreet Deletion': '秘密销毁', 'Remove a card': '移除一张牌', 'A fork in the desert road.': '沙漠公路上的一次抉择。',
  'Continue': '继续', 'Done.': '完成。', 'Not interested': '没兴趣', 'Walk away (heal 6)': '转身离开（恢复 6 点生命）',
  'Scavenge the lab (+card, slight HP loss)': '搜刮实验室（获得卡牌，小幅损失生命）',
  'Cook one last batch (gold or burn)': '再做最后一批（获得金币或被灼伤）',
  'Abandoned RV': '废弃房车', 'Public Defender Roulette': '公设辩护人轮盘', 'Los Pollos Drive-Thru': '炸鸡兄弟汽车餐厅', 'The Well': '沙漠古井',
  'Street Corner': '街头拐角', 'Alley Ambush': '小巷伏击', "Tuco's Place": '图科的地盘', 'DEA Sweep': '缉毒局扫荡', 'Los Pollos HQ': '炸鸡兄弟总部',
  'Walter White': '沃尔特·怀特', 'Saul Goodman': '索尔·古德曼', 'Jesse Pinkman': '杰西·平克曼', 'Mike Ehrmantraut': '迈克·厄曼特劳特',
  'Street Dealer': '街头毒贩', 'Tuco Salamanca': '图科·萨拉曼卡', 'Hank Schrader': '汉克·施拉德', 'Gustavo Fring': '古斯塔沃·弗林',
  'Strike': '打击', 'Defend': '防御', 'Blue Sky': '蓝色天空', 'Say My Name': '说出我的名字', 'Dread': '恐惧', 'Neutralizer': '中和剂',
  "Heisenberg's Hat": '海森堡之帽', "Mike's Pocket Watch": '迈克的怀表', "Saul's Bluetooth": '索尔的蓝牙耳机',
  'Pink Teddy Bear': '粉色泰迪熊', 'Los Pollos Bucket': '炸鸡兄弟全家桶', 'The Ricin Cigarette': '蓖麻毒素香烟',
  'Box Cutter': '美工刀', "Huell's Vacuum": '休尔的吸尘器', 'Kevlar Vest': '防弹背心',
  'attack': '攻击', 'skill': '技能', 'status': '状态', 'common': '普通', 'uncommon': '罕见', 'rare': '稀有', 'legendary': '传奇', 'curse': '诅咒',
  'Victory': '胜利', 'Defeat': '失败', 'Return to Menu': '返回主菜单', 'SHOP': '商店', 'EVENT': '事件', 'REST': '休息', 'COMBAT': '战斗', 'ELITE': '精英', 'BOSS': '首领',
};

let locale = 'en';
export function setLocale(next) {
  locale = next === 'zh' ? 'zh' : 'en';
  document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
  localStorage.setItem('climb-language', locale);
}
export function getLocale() { return locale; }
export function initLocale(saved) { setLocale(saved || localStorage.getItem('climb-language') || 'en'); }

export function t(value) {
  if (locale !== 'zh' || typeof value !== 'string') return value;
  if (ZH[value]) return ZH[value];
  let s = value;
  const replacements = [
    [/^Enter: (.+)$/, (_, x) => `进入：${t(x)}`],
    [/^Rest \(\+(\d+) HP\)$/, (_, n) => `休息（恢复 ${n} 点生命）`],
    [/^Remove a card \((\d+)g\)$/, (_, n) => `移除一张牌（${n} 金币）`],
    [/^Remove one card for (\d+) gold\.$/, (_, n) => `花费 ${n} 金币移除一张牌。`],
    [/^HP (\d+\/\d+)$/, '生命 $1'], [/^GOLD (\d+)$/, '金币 $1'], [/^FLOOR (\d+)$/, '层数 $1'],
    [/^Deck: (\d+) cards$/, '牌组：$1 张'], [/^Relics: (.+)$/, (_, x) => `遗物：${x.split(' · ').map(t).join(' · ')}`],
    [/^DRAW (\d+)$/, '抽牌堆 $1'], [/^DISC (\d+)$/, '弃牌堆 $1'], [/^Phase: (.+)$/, '阶段：$1'],
    [/^Deal (.+) damage\.$/, '造成 $1 点伤害。'], [/^Gain (.+) Block\.$/, '获得 $1 点格挡。'],
    [/^Added card to deck\.$/, '卡牌已加入牌组。'], [/^Not enough energy\.$/, '能量不足。'], [/^Choose a target\.$/, '请选择目标。'],
  ];
  for (const [re, out] of replacements) if (re.test(s)) return s.replace(re, out);
  return s;
}
