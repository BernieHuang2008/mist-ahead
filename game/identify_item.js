import { storage, save_localstorage } from '../utils/localstorage.js';

import { ask_llm } from '../utils/llm.js';

async function identifyItem(index, userInput, history) {
    const item = storage.inventory[index];

    console.log(storage.inventory.map((it, idx) => `- [${idx}] ${it.name} (${it.type})`).join('\n'))
    const response = await ask_llm(
        `
        你需要帮助用户探索一个战利品。用户将对战利品进行某些操作，你要模拟这个过程并返回操作可能造成的对应结果。
        # 物品信息（上帝视角）：
        ${JSON.stringify(item)}

        # 用户的交互历史：
        ${JSON.stringify(history)}

        # 当前用户的操作：
        ${userInput}

        # 用户的操作限制：
        用户只能使用自己仓库中的其他物品，或者自己的身体部位，对该战利品进行探索操作。用户不能使用任何超出自己能力范围的操作，比如使用未获得的高科技设备、魔法等。
        用户的操作应当是现实主义的，符合逻辑且可行。
        用户可使用的物品包括：
        ${storage.inventory.map((it, idx) => `- [${idx}] ${it.name}${it.fully_discovered ? "" : "[?]"} (${it.type})`).join('\n')}
        用户可以使用物品对目标战利品进行操作，也可以尝试将两个物品进行组合、拼接等。若用户使用了其他物品对目标进行探索，则两个物品都需要被损坏（即都要出现在damage字段中）。
        如果用户尝试进行组合，请在summary.user-action字段输出"COMBINE(index1,index2,...)"，其中index1和index2 etc.分别是两个物品在仓库中的索引。
        注意：若某物品的名字后面带有"[?]"，表示该物品本身还未被完全鉴定，**你将不能在result字段中提及它的具体名字**。

        # 任务：
        用户将口述对战利品进行某些操作。你要模拟这个操作，并返回操作可能造成的对应结果。
        这些结果有可能是有利于发现战利品“潜在能力”的，也有可能是损坏物品、不利于发现“潜在能力”，甚至误导性的线索。
        你的宗旨就是：让探索过程充满不确定性和风险，但又有趣味性和戏剧性。

        当用户的探索达到一定程度后，可以根据探索的内容，决定是否让用户发现某个“潜在能力”。
        你需要在返回结果中指出用户是否发现了某个“潜在能力”，如果发现了，请指出是哪个能力（通过能力在ability列表中的序号表示，从0开始）。
        注意：每次探索只能发现一个能力，不能一次性发现多个能力。发现“潜在能力”的过程需要有极强的逻辑性，即用户必须在探索的过程中找到与该能力相关度极高的线索，才能明确发现该能力。

        ${Math.random() < 0.5 ? "注意：上帝说，本次探索不能发现新能力，即使用户的操作非常接近某个能力的线索，也不能让用户发现该能力。" : ""}

        同时，用户的操作会对物品的耐久度造成了损伤，请返回一个1-10的整数，表示物品的耐久度损伤值。

        随机种子：${item.id}

        # 输出格式：
        请使用以下格式返回该战利品的描述：
        {
            "result": "<操作结果描述>",
            "discovered_ability": <ability序号，-1表示未发现>,
            "damage": {
                "<某物品在仓库中的索引>": "<对应的损伤程度> (1-10)"
            },
            "summary": {
                "user-action": "<用户的操作简述/特别代码>",
                "result": "<操作结果简述>"
            }
        }
        其中：
        - result：用户进行了一个操作。该操作有什么回应、有什么结果？请进行描述。你只能描述操作的结果，不能透露任何“潜在能力”相关的信息，除非用户真的发现了某个能力。你也不能透露上帝视角的信息，比如物品的耐久度等。
        - discovered_ability：如果用户发现了该物品的某个潜在能力，请返回该能力在ability列表中的序号（从0开始）。否则返回null。
        - damage：如果该操作对物品造成了损伤，请返回一个1-10的整数，表示物品的耐久度损伤值。
        - summary: 对本次交互的简要总结
        `
    );

    var resjson = JSON.parse(response);

    // append history
    history.push(resjson.summary);

    // make damage [1, 10]
    if (resjson.damage) {
        for (const itemidx in resjson.damage) {
            var dmg = resjson.damage[itemidx];
            dmg = Math.min(10, Math.max(1, Math.round(dmg)));
            storage.inventory[itemidx].durability -= dmg;

            if (storage.inventory[itemidx].durability <= 0) {
                resjson.result += "\n【系统提示】该物品已被损坏，无法继续使用。";
                // TODO: handle broken item
            }
        }
    }

    // update discovered ability
    if (resjson.discovered_ability !== -1 && resjson.discovered_ability !== null) {
        item.ability[resjson.discovered_ability].discovered = true;
        item.fully_discovered = item.ability.every(ab => ab.discovered);
        save_localstorage();
    }

    return resjson;
}

export { identifyItem as exploreItem };