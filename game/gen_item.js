import { storage, save_localstorage } from '../utils/localstorage.js';

import { ask_llm } from '../utils/llm.js';
import { genimg } from '../utils/ai_img.js';

async function generateItem(expected_level = -1) {
    var id = Math.random().toString(10);

    if (expected_level !== -1) {
        id = id.substring(0, 2) + (expected_level < 10 ? "0" + expected_level : expected_level) + id.substring(4);
    }

    const response = await ask_llm(
        `
        用户正在玩一个战利品搜索游戏，你需要生成一个战利品。该战利品的期望为${id.substring(2, 4)}/100级。
        # 背景：
        在一个非洲原始丛林里

        # 任务：
        你需要返回如下几个字段：
        - name: 战利品的名称，应与【背景】部分在情节上有关。
        - type: 战利品的类型，应为useful或decorative，分别表示有用的物品和装饰性的物品。
        - ability: 战利品的潜在能力列表。若type=useful则返回空的ability列表。
          ability指的是战利品可能拥有的用途。注意必须是现实主义的，在等级>90级的时候概率性拥有一些高科技能力，但是不能出现魔法、超能力等非现实主义的能力。
          该列表中的潜在能力应与【name】及【背景】部分在逻辑上有一定相关性，要有**至少1项**ability是表面上没有相关性，但是深层相关的。
        - appearance: 战利品的外观描述，应与【背景】部分在情节上有关，应当具有一定的文学性，描述细致清晰，暗含对应其ability的线索。
          注意：当appearance精美度<15时，无论功能有多强，外观都应比较粗糙简陋，让人感觉没什么价值。当appearance精美度>93时，无论功能有多弱，外观都应非常精美华丽，让人觉得特别高级、值钱。
        
        按照该战利品的期望（${id.substring(2, 4)}/100级）来设计该战利品的各个字段，期望越高，战利品越稀有、能力越强。
        你要生成的这个战利品拥有以下限制：
        ${{
            "实用性物品（useful）": Math.random() < 0.8,
            "appearance精美度": Math.random().toString(10).substring(2, 4) + "/100",
            "ability数量": [id.substring(2, 4) < 30 ? "0项" : (id.substring(2, 4) < 70 ? "1-2项" : "3-4项")],
        }}
        随机种子：${id}

        # 输出格式：
        请使用以下格式返回该战利品的描述：
        {
            "name": "<战利品名称>",
            "type": "<战利品类型: useful/decorative>",
            "ability": [
                "<潜在能力1，若type=useful则返回空的ability列表>",
                ...
            ],
            "appearance": "<战利品外观描述>"
        }
        `
    );

    var resjson = JSON.parse(response);

    return {
        id: id,
        fully_discovered: false,
        claim_date: new Date().toLocaleDateString(),
        name: resjson.name,
        type: resjson.type,
        ability: resjson.ability.map(item => (
            {
                ability: item,
                discovered: false
            }
        )),
        appearance: resjson.appearance,
        durability: Number(id.substring(5, 7)) * 2 + 1
    };
}

var test = await generateItem();
console.log(test);
// document.write("<image src='" + genimg(test.appearance) + "' alt='item image'/>");
console.log("Generated item image:", genimg(test.appearance));
storage.inventory.push(test);
save_localstorage();

export { generateItem };
