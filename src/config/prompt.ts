export interface StyleItem {
  id: number;
  name: string;
  description: string;
  suitable_for: string;
  prompt: string;
  negative_prompt: string;
  icon: string;
  color: string;
  textColor: string;
}

export const prompts: StyleItem[] = [
    {
        "id": 1,
        "name": "宫崎骏治愈系",
        "description": "日系动画质感，温柔又梦幻",
        "suitable_for": "所有萌宠",
        "icon": "🌸",
        "color": "#8E97FD",
        "textColor": "text-white",
        "prompt": "(masterpiece:1.2), (best quality:1.2), Studio Ghibli style, hand-drawn anime illustration, soft cel shading, anthropomorphic character transformation, the cute pet in the original image is transformed into an adorable anime character with [pet_color] hair and cute animal ears, KEEP EXACT SAME POSE AND EXPRESSION AS ORIGINAL, KEEP ORIGINAL BACKGROUND UNCHANGED, wearing cozy vintage outfit, maintaining the exact same body position and facial expression, warm golden hour lighting, watercolor texture, dreamy atmosphere, (vibrant pastel colors:1.1), art by Hayao Miyazaki, seamless background preservation",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, jpeg artifacts, oversaturated, dark, gloomy, different background, changed background, new background, altered pose, different expression"
    },
    {
        "id": 2,
        "name": "韩系氧气风",
        "description": "清新自然，初恋感满满",
        "suitable_for": "所有萌宠",
        "icon": "🍃",
        "color": "#6CB28E",
        "textColor": "text-white",
        "prompt": "(masterpiece:1.2), (photorealistic:1.3), 8k UHD, professional portrait photography, anthropomorphic character transformation, transform the pet into a fresh natural beauty/handsome with [pet_color] soft fluffy hair and subtle animal ears, KEEP EXACT SAME POSE AND EXPRESSION AS ORIGINAL PET, KEEP ORIGINAL BACKGROUND UNCHANGED AND BLURRED, wearing minimalist white linen outfit, maintaining identical body position and facial mood, soft bokeh effect on original background, soft diffused sunlight, Canon EOS R5, 85mm f/1.2 lens, dreamy and romantic atmosphere, seamless integration",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, over-processed, harsh lighting, flash photography, different background, new background, changed pose, different expression"
    },
    {
        "id": 3,
        "name": "法式复古胶片",
        "description": "电影级质感，优雅永不过时",
        "suitable_for": "气质优雅的猫咪和狗狗",
        "icon": "🎞️",
        "color": "#D4A574",
        "textColor": "text-white",
        "prompt": "(masterpiece:1.2), (best quality:1.2), cinematic film photography, shot on Kodak Portra 400, anthropomorphic character transformation, transform the pet into an elegant sophisticated character with [pet_color] glossy hair and refined animal features, KEEP EXACT SAME POSE AND ELEGANT EXPRESSION AS ORIGINAL, KEEP ORIGINAL BACKGROUND UNCHANGED, wearing vintage Parisian fashion, silk scarf, pearl accessories, maintaining identical body position and mood, soft film grain, warm color grading, golden hour, romantic and nostalgic mood, vogue editorial style, seamless background preservation",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, digital artifacts, cold colors, harsh shadows, different background, new background, altered pose, changed expression"
    },
    {
        "id": 4,
        "name": "赛博朋克未来",
        "description": "酷飒科技风，视觉冲击力拉满",
        "suitable_for": "深色毛发或酷酷的萌宠",
        "icon": "🤖",
        "color": "#3F414E",
        "textColor": "text-white",
        "prompt": "(masterpiece:1.2), (best quality:1.2), cyberpunk aesthetic, unreal engine 5 render, ray tracing, anthropomorphic character transformation, transform the pet into a cool futuristic character with [pet_color] hair and cybernetic animal ears, KEEP EXACT SAME COOL POSE AND EXPRESSION AS ORIGINAL, KEEP ORIGINAL BACKGROUND UNCHANGED, wearing techwear with LED strips, maintaining identical body position and attitude, volumetric lighting, neon blue and magenta highlights, cinematic composition, 8k wallpaper quality, seamless background integration",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, low resolution, pixelated, different background, city background, neon city, altered pose, different expression"
    },
    {
        "id": 5,
        "name": "魔法学院风",
        "description": "霍格沃茨氛围，神秘又浪漫",
        "suitable_for": "所有萌宠",
        "icon": "✨",
        "color": "#9B6B9E",
        "textColor": "text-white",
        "prompt": "(masterpiece:1.2), (best quality:1.2), fantasy digital art, concept art style, anthropomorphic character transformation, transform the pet into a young wizard/witch with [pet_color] hair and magical animal ears, KEEP EXACT SAME POSE AND CURIOUS EXPRESSION AS ORIGINAL, KEEP ORIGINAL BACKGROUND UNCHANGED, wearing elegant Hogwarts-style robes with house scarf, maintaining identical body position and mood, surrounded by subtle floating magical particles, warm magical lighting, mystical and enchanting, seamless background preservation",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, dark, horror, scary, different background, library background, castle background, altered pose, different expression"
    },
    {
        "id": 6,
        "name": "新中式国风",
        "description": "东方美学天花板，仙气飘飘",
        "suitable_for": "长毛或白色毛发萌宠",
        "icon": "🏮",
        "color": "#C75B5B",
        "textColor": "text-white",
        "prompt": "(masterpiece:1.2), (best quality:1.2), Chinese xianxia fantasy art, intricate digital painting, anthropomorphic character transformation, transform the pet into an ethereal cultivator with [pet_color] flowing hair and spirit animal ears, KEEP EXACT SAME GRACEFUL POSE AND EXPRESSION AS ORIGINAL, KEEP ORIGINAL BACKGROUND UNCHANGED, wearing layered translucent Hanfu with embroidery, maintaining identical body position and serene mood, soft mystical glow, magical floating petals, serene and divine atmosphere, seamless background integration",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, western elements, modern clothing, different background, bamboo forest, mountain background, altered pose, changed expression"
    },
    {
        "id": 7,
        "name": "奶油ins治愈风",
        "description": "软萌可爱，治愈系天花板",
        "suitable_for": "胖乎乎或呆萌的萌宠",
        "icon": "🧸",
        "color": "#F5D5C8",
        "textColor": "text-ink",
        "prompt": "(masterpiece:1.2), (best quality:1.2), cozy lifestyle photography, soft warm lighting, anthropomorphic character transformation, transform the pet into an adorable character with [pet_color] fluffy bedhead hair and cute animal ears, KEEP EXACT SAME CUTE SLEEPY POSE AND EXPRESSION AS ORIGINAL, KEEP ORIGINAL BACKGROUND UNCHANGED, wearing oversized pastel knit sweater, maintaining identical body position and cozy mood, soft bokeh on original background, warm color palette, healing and wholesome vibe, Instagram aesthetic, seamless background preservation",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, cold colors, dark, edgy, different background, bedroom background, bed background, altered pose, different expression"
    },
    {
        "id": 8,
        "name": "街头潮流风",
        "description": "潮酷有型，朋友圈点赞收割机",
        "suitable_for": "自带气场的萌宠",
        "icon": "👟",
        "color": "#FA6E5A",
        "textColor": "text-white",
        "prompt": "(masterpiece:1.2), (best quality:1.2), high fashion streetwear photography, professional lookbook shot, anthropomorphic character transformation, transform the pet into a confident trendy character with [pet_color] styled hair and cool animal ears, KEEP EXACT SAME CONFIDENT POSE AND ATTITUDE EXPRESSION AS ORIGINAL, KEEP ORIGINAL BACKGROUND UNCHANGED, wearing limited edition hypebeast outfit, maintaining identical body position and swagger, harsh flash with natural fill light, high contrast, vibrant colors, seamless background integration",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, boring, plain, different background, street background, graffiti background, altered pose, different expression"
    },
    {
        "id": 9,
        "name": "二次元SSR卡",
        "description": "游戏原画级别，闪瞎朋友圈",
        "suitable_for": "所有想要惊艳效果的萌宠",
        "icon": "💎",
        "color": "#7B68EE",
        "textColor": "text-white",
        "prompt": "(masterpiece:1.3), (best quality:1.3), official game art, anime game character style, anthropomorphic character transformation, transform the pet into a breathtaking divine character with [pet_color] gradient hair and majestic animal features, KEEP EXACT SAME DRAMATIC POSE AND EXPRESSION AS ORIGINAL, KEEP ORIGINAL BACKGROUND UNCHANGED, wearing elaborate fantasy costume with gold filigree, maintaining identical body position and mood, surrounded by subtle elemental magic particles, volumetric rim lighting, iridescent color accents, ultra detailed, 8k resolution, seamless background preservation",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, low effort, sketch lines, different background, fantasy background, magic background, altered pose, different expression"
    },
    {
        "id": 10,
        "name": "美式复古漫画",
        "description": "大胆撞色，超吸睛个性风",
        "suitable_for": "搞怪或表情丰富的萌宠",
        "icon": "💥",
        "color": "#FF6B9D",
        "textColor": "text-white",
        "prompt": "(masterpiece:1.2), (best quality:1.2), vintage comic book art, Roy Lichtenstein inspired, bold pop art style, anthropomorphic character transformation, transform the pet into an expressive character with [pet_color] hair and cartoon animal ears, KEEP EXACT SAME EXPRESSIVE POSE AND FUNNY EXPRESSION AS ORIGINAL, KEEP ORIGINAL BACKGROUND UNCHANGED IN COMIC STYLE, wearing 1960s retro fashion, maintaining identical body position and energy, thick black outlines, vibrant saturated colors (red, yellow, cyan, magenta), fun and energetic, highly stylized, seamless background integration",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, realistic, photographic, muted colors, different background, dot background, action lines background, altered pose, different expression"
    }
]
