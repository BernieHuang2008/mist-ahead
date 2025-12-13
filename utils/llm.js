const output_specification = `
# 你的任务：
- think step by steps.思考的内容写在<think>标签中。
- 将最终输出的结果写在<response>标签中。
`;

async function ask_llm(prompt, system = "") {
    var full_text_prompt = system + "\n\n" + prompt + "\n\n" + output_specification;

    var response = await fetch("https://text.pollinations.ai/" + encodeURIComponent(full_text_prompt), {
        method: "GET",
    })

    var origin = await response.text()+"</response>";
    const match = origin.match(/<response>([\s\S]*?)<\/response>/);
    return match ? match[1] : origin;
}

export { ask_llm };