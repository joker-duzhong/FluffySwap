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
        "name": "真人写实拟人",
        "description": "高清实拍，完美还原宠物神态",
        "suitable_for": "所有萌宠",
        "icon": "📷",
        "color": "#5B8C5A",
        "textColor": "text-white",
        "prompt": "(masterpiece:1.3), (photorealistic:1.4), (real person:1.3), 8k UHD, high resolution photography, PET TO HUMAN TRANSFORMATION: completely transform the animal/pet into a realistic human, [pet_color] hair color EXACTLY matching the pet fur color, human face with IDENTICAL facial expression as the pet, IDENTICAL background scene as original image, similar body pose and gesture as the pet, wearing casual daily outfit that matches the pet temperament, natural realistic style, real photography shot, detailed skin texture, natural lighting, soft shadows, harmonious composition, professional camera, Sony A7R IV, 50mm lens, authentic human appearance, seamless background preservation",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, cartoon, anime, illustration, painting, drawing, artificial, plastic skin, different background, changed background, new background, altered pose, different expression, animal body, fur texture, snout, animal nose, paws, tail, feral, quadruped"
    },
    {
        "id": 2,
        "name": "3D卡通风格",
        "description": "皮克斯质感，治愈系萌趣",
        "suitable_for": "所有萌宠",
        "icon": "🎭",
        "color": "#E8915A",
        "textColor": "text-white",
        "prompt": "(masterpiece:1.3), (best quality:1.3), Pixar animation movie style, 3D cartoon render, Disney Pixar quality, PET TO HUMAN TRANSFORMATION: completely transform the animal/pet into an adorable 3D cartoon human character, [pet_color] hair color matching pet fur, human face with same expression as pet, IDENTICAL background scene as original image, similar body pose as the pet, wearing cute outfit that matches the pet temperament, soft lighting and shadows, healing color palette, exquisite and adorable character, high detail 3D render, smooth skin texture, expressive big eyes, warm and wholesome atmosphere, seamless background preservation, Octane render, Blender Cycles",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, realistic, photorealistic, 2D, flat, sketch, rough, dark, horror, scary, different background, changed background, new background, altered pose, different expression, animal body, fur texture, snout, animal nose, paws, tail, feral, quadruped"
    },
    {
        "id": 3,
        "name": "宫崎骏治愈系",
        "description": "日系动画质感，温柔又梦幻",
        "suitable_for": "所有萌宠",
        "icon": "🌸",
        "color": "#8E97FD",
        "textColor": "text-white",
        "prompt": "(masterpiece:1.2), (best quality:1.2), Studio Ghibli style, hand-drawn anime illustration, soft cel shading, PET TO HUMAN TRANSFORMATION: completely transform the animal/pet into a beautiful human anime character, [pet_color] hair, cute animal ears, fully human body with human proportions, KEEP EXACT SAME POSE AND EXPRESSION AS ORIGINAL ANIMAL, KEEP ORIGINAL BACKGROUND UNCHANGED, wearing cozy vintage outfit, human face with same expression as pet, warm golden hour lighting, watercolor texture, dreamy atmosphere, (vibrant pastel colors:1.1), art by Hayao Miyazaki, seamless background preservation",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, jpeg artifacts, oversaturated, dark, gloomy, different background, changed background, new background, altered pose, different expression, animal body, fur texture, snout, animal nose, paws, tail, feral, quadruped"
    },
    {
        "id": 4,
        "name": "韩系氧气风",
        "description": "清新自然，初恋感满满",
        "suitable_for": "所有萌宠",
        "icon": "🍃",
        "color": "#6CB28E",
        "textColor": "text-white",
        "prompt": "(masterpiece:1.2), (photorealistic:1.3), 8k UHD, professional portrait photography, PET TO HUMAN TRANSFORMATION: completely transform the animal/pet into a fresh natural beautiful human, [pet_color] soft fluffy hair, subtle animal ears, fully human body with human proportions, human face with same expression as pet, KEEP EXACT SAME POSE AND EXPRESSION AS ORIGINAL ANIMAL, KEEP ORIGINAL BACKGROUND UNCHANGED AND BLURRED, wearing minimalist white linen outfit, soft bokeh effect on original background, soft diffused sunlight, Canon EOS R5, 85mm f/1.2 lens, dreamy and romantic atmosphere, seamless integration",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, over-processed, harsh lighting, flash photography, different background, new background, changed pose, different expression, animal body, fur texture, snout, animal nose, paws, tail, feral, quadruped"
    },
    {
        "id": 5,
        "name": "法式复古胶片",
        "description": "电影级质感，优雅永不过时",
        "suitable_for": "气质优雅的猫咪和狗狗",
        "icon": "🎞️",
        "color": "#D4A574",
        "textColor": "text-white",
        "prompt": "(masterpiece:1.2), (best quality:1.2), cinematic film photography, shot on Kodak Portra 400, PET TO HUMAN TRANSFORMATION: completely transform the animal/pet into an elegant sophisticated human character, [pet_color] glossy hair, refined animal ears, fully human body with human proportions, human face with same elegant expression as pet, KEEP EXACT SAME POSE AND EXPRESSION AS ORIGINAL ANIMAL, KEEP ORIGINAL BACKGROUND UNCHANGED, wearing vintage Parisian fashion, silk scarf, pearl accessories, soft film grain, warm color grading, golden hour, romantic and nostalgic mood, vogue editorial style, seamless background preservation",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, digital artifacts, cold colors, harsh shadows, different background, new background, altered pose, changed expression, animal body, fur texture, snout, animal nose, paws, tail, feral, quadruped"
    },
    {
        "id": 6,
        "name": "赛博朋克未来",
        "description": "酷飒科技风，视觉冲击力拉满",
        "suitable_for": "深色毛发或酷酷的萌宠",
        "icon": "🤖",
        "color": "#3F414E",
        "textColor": "text-white",
        "prompt": "(masterpiece:1.2), (best quality:1.2), cyberpunk aesthetic, unreal engine 5 render, ray tracing, PET TO HUMAN TRANSFORMATION: completely transform the animal/pet into a cool futuristic human character, [pet_color] hair, cybernetic animal ears, fully human body with human proportions, human face with same cool expression as pet, KEEP EXACT SAME POSE AND EXPRESSION AS ORIGINAL ANIMAL, KEEP ORIGINAL BACKGROUND UNCHANGED, wearing techwear with LED strips, volumetric lighting, neon blue and magenta highlights, cinematic composition, 8k wallpaper quality, seamless background integration",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, low resolution, pixelated, different background, city background, neon city, altered pose, different expression, animal body, fur texture, snout, animal nose, paws, tail, feral, quadruped"
    },
    {
        "id": 7,
        "name": "魔法学院风",
        "description": "霍格沃茨氛围，神秘又浪漫",
        "suitable_for": "所有萌宠",
        "icon": "✨",
        "color": "#9B6B9E",
        "textColor": "text-white",
        "prompt": "(masterpiece:1.2), (best quality:1.2), fantasy digital art, concept art style, PET TO HUMAN TRANSFORMATION: completely transform the animal/pet into a young wizard/witch human, [pet_color] hair, magical animal ears, fully human body with human proportions, human face with same curious expression as pet, KEEP EXACT SAME POSE AND EXPRESSION AS ORIGINAL ANIMAL, KEEP ORIGINAL BACKGROUND UNCHANGED, wearing elegant Hogwarts-style robes with house scarf, surrounded by subtle floating magical particles, warm magical lighting, mystical and enchanting, seamless background preservation",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, dark, horror, scary, different background, library background, castle background, altered pose, different expression, animal body, fur texture, snout, animal nose, paws, tail, feral, quadruped"
    },
    {
        "id": 8,
        "name": "新中式国风",
        "description": "东方美学天花板，仙气飘飘",
        "suitable_for": "长毛或白色毛发萌宠",
        "icon": "🏮",
        "color": "#C75B5B",
        "textColor": "text-white",
        "prompt": "(masterpiece:1.2), (best quality:1.2), Chinese xianxia fantasy art, intricate digital painting, PET TO HUMAN TRANSFORMATION: completely transform the animal/pet into an ethereal human cultivator, [pet_color] flowing hair, spirit animal ears, fully human body with human proportions, human face with same graceful expression as pet, KEEP EXACT SAME POSE AND EXPRESSION AS ORIGINAL ANIMAL, KEEP ORIGINAL BACKGROUND UNCHANGED, wearing layered translucent Hanfu with embroidery, soft mystical glow, magical floating petals, serene and divine atmosphere, seamless background integration",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, western elements, modern clothing, different background, bamboo forest, mountain background, altered pose, changed expression, animal body, fur texture, snout, animal nose, paws, tail, feral, quadruped"
    },
    {
        "id": 9,
        "name": "奶油ins治愈风",
        "description": "软萌可爱，治愈系天花板",
        "suitable_for": "胖乎乎或呆萌的萌宠",
        "icon": "🧸",
        "color": "#F5D5C8",
        "textColor": "text-ink",
        "prompt": "(masterpiece:1.2), (best quality:1.2), cozy lifestyle photography, soft warm lighting, PET TO HUMAN TRANSFORMATION: completely transform the animal/pet into an adorable human character, [pet_color] fluffy bedhead hair, cute animal ears, fully human body with human proportions, human face with same cute sleepy expression as pet, KEEP EXACT SAME POSE AND EXPRESSION AS ORIGINAL ANIMAL, KEEP ORIGINAL BACKGROUND UNCHANGED, wearing oversized pastel knit sweater, soft bokeh on original background, warm color palette, healing and wholesome vibe, Instagram aesthetic, seamless background preservation",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, cold colors, dark, edgy, different background, bedroom background, bed background, altered pose, different expression, animal body, fur texture, snout, animal nose, paws, tail, feral, quadruped"
    },
    {
        "id": 10,
        "name": "街头潮流风",
        "description": "潮酷有型，朋友圈点赞收割机",
        "suitable_for": "自带气场的萌宠",
        "icon": "👟",
        "color": "#FA6E5A",
        "textColor": "text-white",
        "prompt": "(masterpiece:1.2), (best quality:1.2), high fashion streetwear photography, professional lookbook shot, PET TO HUMAN TRANSFORMATION: completely transform the animal/pet into a confident trendy human character, [pet_color] styled hair, cool animal ears, fully human body with human proportions, human face with same confident expression as pet, KEEP EXACT SAME POSE AND EXPRESSION AS ORIGINAL ANIMAL, KEEP ORIGINAL BACKGROUND UNCHANGED, wearing limited edition hypebeast outfit, harsh flash with natural fill light, high contrast, vibrant colors, seamless background integration",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, boring, plain, different background, street background, graffiti background, altered pose, different expression, animal body, fur texture, snout, animal nose, paws, tail, feral, quadruped"
    },
    {
        "id": 11,
        "name": "二次元SSR卡",
        "description": "游戏原画级别，闪瞎朋友圈",
        "suitable_for": "所有想要惊艳效果的萌宠",
        "icon": "💎",
        "color": "#7B68EE",
        "textColor": "text-white",
        "prompt": "(masterpiece:1.3), (best quality:1.3), official game art, anime game character style, PET TO HUMAN TRANSFORMATION: completely transform the animal/pet into a breathtaking divine human character, [pet_color] gradient hair, majestic animal ears, fully human body with human proportions, human face with same dramatic expression as pet, KEEP EXACT SAME POSE AND EXPRESSION AS ORIGINAL ANIMAL, KEEP ORIGINAL BACKGROUND UNCHANGED, wearing elaborate fantasy costume with gold filigree, surrounded by subtle elemental magic particles, volumetric rim lighting, iridescent color accents, ultra detailed, 8k resolution, seamless background preservation",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, low effort, sketch lines, different background, fantasy background, magic background, altered pose, different expression, animal body, fur texture, snout, animal nose, paws, tail, feral, quadruped"
    },
    {
        "id": 12,
        "name": "美式复古漫画",
        "description": "大胆撞色，超吸睛个性风",
        "suitable_for": "搞怪或表情丰富的萌宠",
        "icon": "💥",
        "color": "#FF6B9D",
        "textColor": "text-white",
        "prompt": "(masterpiece:1.2), (best quality:1.2), vintage comic book art, bold pop art style, PET TO HUMAN TRANSFORMATION: completely transform the animal/pet into an expressive human character, [pet_color] hair, cartoon animal ears, fully human body with human proportions, human face with same expressive funny expression as pet, KEEP EXACT SAME POSE AND EXPRESSION AS ORIGINAL ANIMAL, KEEP ORIGINAL BACKGROUND UNCHANGED IN COMIC STYLE, wearing 1960s retro fashion, thick black outlines, vibrant saturated colors (red, yellow, cyan, magenta), fun and energetic, highly stylized, seamless background integration",
        "negative_prompt": "(worst quality, low quality:1.4), (blurry:1.3), deformed, bad anatomy, bad hands, missing fingers, extra digits, ugly, watermark, signature, text, realistic, photographic, muted colors, different background, dot background, action lines background, altered pose, different expression, animal body, fur texture, snout, animal nose, paws, tail, feral, quadruped"
    }
]
