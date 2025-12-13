# 物品生成逻辑 (Item Generation Logic)

该文档描述了 `game/gen_item.js` 中定义的物品生成核心逻辑。

## 1. 基础属性生成

### ID 生成
- 生成一个随机的数字字符串作为 ID。
- ID 的第 3-4 位（索引 2-3）代表物品的**期望等级 (Expected Level)**，范围 00-99。

### 类型 (Type) 概率
物品类型通过随机数决定：
- **40%** 概率为 `decorative` (装饰性物品)
- **50%** 概率为 `material` (材料/半成品)
- **10%** 概率为 `tools` (工具)

### 耐久度 (Durability)
- 耐久度由 ID 的第 6-7 位（索引 5-6）决定。
- 公式：`durability = Number(id.substring(5, 7)) * 2 + 1`
- 范围：约为 1 - 199。

## 2. LLM 生成内容

系统调用 LLM 根据上述基础属性生成详细描述。

### 输入参数
- **期望等级**：决定物品的稀有度和能力强弱。
- **背景**：设定为“非洲原始丛林”。
- **精美度 (Exquisiteness)**：随机生成 (00-99)。
  - `< 15`：外观粗糙简陋，让人感觉无价值。
  - `> 93`：外观精美华丽，让人觉得高级。

### 生成字段

#### Name (名称)
- 与背景情节相关。
- 若类型为 `tools`，则必须是现实存在的工具名称（如螺丝刀、万用表）。

#### Ability (潜在能力)
- **数量限制**：
  - 等级 < 30: **0 项**
  - 30 <= 等级 < 70: **1-2 项**
  - 等级 >= 70: **3-4 项**
- **内容要求**：
  - 必须是现实主义的（>90级可有高科技，但不可有魔法）。
  - 至少有一项能力表面无相关性，但深层相关。
- **非 Material 类型**：若类型不是 `material`，通常返回空列表。

#### Appearance (外观)
- 文学性描述，暗含能力线索。
- 若类型为 `tools`，直接返回名称，并设定天蓝色背景。

## 3. 物品对象结构

最终存储在 `storage.inventory` 中的物品对象结构如下：

```javascript
{
    "id": "String (随机生成的数字字符串)",
    "fully_discovered": "Boolean (初始为 false, 当所有 ability 被发现后变为 true)",
    "claim_date": "String (获取日期, locale string)",
    "name": "String (物品名称, 由 AI 生成)",
    "type": "String ('decorative' | 'material' | 'tools')",
    "ability": [
        {
            "condition": "String (触发条件, 由 AI 生成)",
            "ability": "String (能力描述, 由 AI 生成)",
            "discovered": "Boolean (初始为 false)"
        }
    ],
    "appearance": "String (外观描述, 由 AI 生成)",
    "durability": "Number (耐久度, 由 ID 计算得出)"
}
```
