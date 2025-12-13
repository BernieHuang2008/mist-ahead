function genimg(prompt) {
    var full_text_prompt = `
        生成一个现实主义风格的写实物品：
        ${prompt}
        要求：
        - 写实风格
        - 只有物品单独放在纯净的白色背景上，不需要有多余的其他物品。
    `;

    // return "https://image.pollinations.ai/prompt/" + encodeURIComponent(full_text_prompt) + "?width=2048&height=2048&nologo=true&model=turbo";
    return "https://enter.pollinations.ai/api/generate/image/" + encodeURIComponent(full_text_prompt) + "?width=2048&height=2048&nologo=true&model=nanobanana&key=plln_pk_DSf8DvxaLKn2LbP9QQAlA5hFpQGXePYiSY1AHZQn2CiKgtO7VBKQ1FNw1xCEpRYK";
}

export { genimg };