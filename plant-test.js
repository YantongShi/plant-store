// 测试问题数据
const questions = [
    {
        question: "选择新的植物时，你更看重：",
        options: [
            { text: "适应本地气候的品种", dimensions: { S: 1 } },
            { text: "观赏价值高的品种", dimensions: { F: 1 } },
            { text: "有特殊意义的品种", dimensions: { N: 1 } }
        ]
    },
    {
        question: "你理想中的植物香气是：",
        options: [
            { text: "薄荷/迷迭香的凛冽", dimensions: { T: 1 } },
            { text: "栀子/茉莉的甜暖", dimensions: { F: 1 } },
            { text: "雨后泥土的清新", dimensions: { S: 1 } }
        ]
    },
    {
        question: "朋友送你一盆正在开花的植物，你会优先考虑：",
        options: [
            { text: "查找这种花的养护要点", dimensions: { J: 1 } },
            { text: "放在采光好的位置任其生长", dimensions: { P: 1 } },
            { text: "等花谢后再研究怎么养护", dimensions: { P: 1 } }
        ]
    },
    {
        question: "清晨醒来，你发现窗台的植物叶子有些蔫了，这时你会：",
        options: [
            { text: "立即查看土壤湿度并适量浇水", dimensions: { J: 1 } },
            { text: "先观察一天，可能是暂时的现象", dimensions: { P: 1 } },
            { text: "移动位置避免阳光直射", dimensions: { S: 1 } }
        ]
    },
    {
        question: "发现植物新长出的嫩叶上有虫害痕迹，你的做法是：",
        options: [
            { text: "立即购买专用药剂处理", dimensions: { T: 1 } },
            { text: "尝试用自制的环保方法除虫", dimensions: { F: 1 } },
            { text: "先隔离观察再做决定", dimensions: { P: 1 } }
        ]
    },
    {
        question: "植物长势过于茂盛需要修剪时，你倾向于：",
        options: [
            { text: "按照园艺指南科学修剪", dimensions: { J: 1 } },
            { text: "只修剪明显杂乱的枝条", dimensions: { P: 1 } },
            { text: "不太愿意主动修剪", dimensions: { P: 1 } }
        ]
    },
    {
        question: "冬季来临，你会如何调整植物的养护：",
        options: [
            { text: "严格控制浇水量并保持温度", dimensions: { J: 1 } },
            { text: "移到室内但维持原有养护节奏", dimensions: { P: 1 } },
            { text: "基本不做特别调整", dimensions: { P: 1 } }
        ]
    },
    {
        question: "准备外出度假两周，你会如何安排家里的植物：",
        options: [
            { text: "提前准备好自动灌溉装置", dimensions: { J: 1 } },
            { text: "托付给细心的朋友照料", dimensions: { F: 1 } },
            { text: "浇透水后放在阴凉处", dimensions: { P: 1 } }
        ]
    },
    {
        question: "在植物养护过程中，你更享受：",
        options: [
            { text: "按照计划执行每个养护步骤的掌控感", dimensions: { J: 1 } },
            { text: "观察植物每天细微变化的惊喜感", dimensions: { N: 1 } },
            { text: "植物自由生长带来的轻松感", dimensions: { P: 1 } }
        ]
    },
    {
        question: "当看到自己养护的植物开花结果时，你最大的感受是：",
        options: [
            { text: "成就感：我的精心照料得到了回报", dimensions: { T: 1 } },
            { text: "幸福感：见证生命成长的美好", dimensions: { F: 1 } },
            { text: "平常心：这是自然规律的一部分", dimensions: { P: 1 } }
        ]
    }
];

// 人格类型映射
const personalityTypes = {
    ISTJ: {
        plant: "雪松",
        description: "守卫者：挺拔坚韧，年轮如法典般严谨，树冠庇护弱小生物。环境需求：-25℃至20℃/耐寒抗旱/向阳生长。正向解读：风雪中的秩序守护者，根系编织大地之网。",
        analysis: "你像雪松一样坚韧、可靠，注重规则和秩序。你的思维严谨，做事有条理，是团队中的"稳定器"。但有时过于坚持原则，可能显得固执，容易忽视情感需求。",
        healing: "✅ 放松控制：偶尔允许自己"不完美"，尝试随性散步或冥想，感受自然的流动。\n✅ 情感表达：写日记或与信任的人分享感受，练习接纳柔软的情绪。\n🌿 推荐植物：薰衣草（舒缓焦虑）、竹子（学习柔韧）。"
    },
    ISFJ: {
        plant: "木绣球",
        description: "保护者：层层花瓣包裹核心，为昆虫提供蜜源与庇护所。生态特质：18-25℃/湿润荫蔽/花团锦簇。治愈启示：温柔不是脆弱，是容纳万千生命的宇宙。",
        analysis: "你如木绣球般温柔包容，默默守护他人。你细心体贴，但可能过度付出，导致能量耗尽。习惯回避冲突，容易积累委屈。",
        healing: "✅ 设立边界：练习说"不"，优先照顾自己的需求。\n✅ 自我肯定：每天记录3件你为自己做的事，强化自我价值感。\n🌿 推荐植物：康乃馨（象征自爱）、芦荟（疗愈能量）。"
    },
    INFJ: {
        plant: "菩提树",
        description: "倡导者：叶片心形脉络，荫蔽下易产生顿悟体验。智慧密码：热带季风气候/树冠直径可达30米。成长隐喻：向下扎根与向上开悟的永恒平衡。",
        analysis: "你像菩提树，充满智慧与灵性，渴望深度联结。你容易共情他人，但也可能因理想主义而疲惫，或因现实落差感到孤独。",
        healing: "✅ 独处充电：定期闭关半日，阅读、静坐或在大自然中独行。\n✅ 落地实践：将宏大愿景拆解为小目标，避免过度思考。\n🌿 推荐植物：莲花（心灵净化）、白鹤芋（平衡能量）。"
    },
    INTJ: {
        plant: "红杉",
        description: "战略家：垂直生长的精准计算，林冠层的全局视野。生存奇迹：树高超百米/耐火树皮/群体抗风。生命诗学：向云端生长的野心，深埋地下的谦卑。",
        analysis: "你是红杉般的战略家，理性、独立，追求高效。但过度依赖逻辑可能压抑情感，显得疏离。完美主义会让你对他人（和自己）过于苛刻。",
        healing: "✅ 拥抱不确定性：尝试一件不设计划的事（如随意旅行）。\n✅ 情感练习：每周一次"感性时间"，听音乐或看催泪电影。\n🌿 推荐植物：龙舌兰（坚韧而灵动）、龟背竹（打破规则之美）。"
    },
    ISTP: {
        plant: "白桦",
        description: "工匠：极简美学，树皮自我更新，汁液可疗伤。生存特质：-50℃存活。行动哲学：剥离所有冗余，在寒风中书写银白色的诗。",
        analysis: "你如白桦般自由洒脱，擅长动手解决问题。讨厌束缚，但可能逃避长期承诺。习惯用"冷漠"掩饰敏感，容易感到孤独。",
        healing: "✅ 深度联结：尝试定期与好友深度对话，而非仅分享兴趣。\n✅ 情绪命名：当感到烦躁时，写下具体情绪（如"我生气是因为..."）。\n🌿 推荐植物：空气凤梨（无需土壤的自由）、仙人掌（外刚内柔）。"
    },
    ISFP: {
        plant: "蓝花楹",
        description: "艺术家：梦幻周期，25℃花期爆发，落花铺就紫色星海。创造宣言：用整个冬季的沉默，兑换一场春天的视觉革命。",
        analysis: "你是蓝花楹般的浪漫主义者，审美敏锐，追求独特。但敏感易受伤，常因批评自我怀疑。习惯用"逃避"应对压力。",
        healing: "✅ 创作疗愈：用艺术（绘画、音乐）表达情绪，而非压抑。\n✅ 强化内核：每天夸自己一个优点，减少对外界评价的依赖。\n🌿 推荐植物：三色堇（多彩的自我）、郁金香（优雅的自信）。"
    },
    INFP: {
        plant: "樱花",
        description: "治愈者：物哀美学，精准温控开花，花瓣雨中集体冥想。生命教育：极致绽放与坦然凋零的勇气同样珍贵。",
        analysis: "你如樱花般纯粹，相信每个灵魂都值得温柔以待。极致绽放的勇气背后，是对生命短暂的深刻觉知。常常在治愈他人时，自己的花瓣却悄悄飘落。",
        healing: "✅ 自我关怀：设立"樱花日"，只做滋养自己的事。\n✅ 接纳脆弱：收集落樱制作标本，练习欣赏生命各阶段的美。\n🌿 推荐植物：雏菊（简单快乐）、含羞草（保护敏感心灵）。"
    },
    INTP: {
        plant: "银杏",
        description: "学者：时空穿越者，抗污染，雌雄异株，叶片二分脉。思维图腾：活化石的古老智慧与分形几何的现代性共舞。",
        analysis: "你是银杏般的思考者，用二分脉络解析世界。热爱知识迷宫，却可能困在自己编织的思维网络中。雌雄异株的特性暗示着你时而渴望交流，时而享受独处。",
        healing: "✅ 思维落地：将理论转化为可操作的实验（如种植观察）。\n✅ 感官唤醒：触摸不同纹理的叶片，重新连接身体感知。\n🌿 推荐植物：捕蝇草（互动中打破僵化）、铁线蕨（培养细腻）。"
    },
    ESTP: {
        plant: "凤凰木",
        description: "挑战者：烈焰宣言，30℃盛放，根系突破混凝土。能量法则：在高温中淬炼，把荒芜变成火红的庆典。",
        analysis: "你如凤凰木般热烈张扬，根系能突破混凝土的束缚。享受即兴发挥的快感，但冲动可能带来不必要的风险。讨厌例行公事，渴望持续的新鲜刺激。",
        healing: "✅ 风险评估：行动前花10分钟列出利弊清单。\n✅ 沉淀练习：每天静坐5分钟，观察呼吸的流动。\n🌿 推荐植物：火焰木（炽热但有序）、虎尾兰（培养耐心）。"
    },
    ESFP: {
        plant: "牡丹",
        description: "表演者：盛唐气象，15-25℃，雍容华贵，花径达30cm。存在哲学：拒绝含蓄的美学，要开就开成传奇。",
        analysis: "你是牡丹般的魅力中心，雍容华贵，天生擅长点燃气氛。但过度依赖外界反馈，独处时容易陷入存在性焦虑。讨厌被忽视，需要持续的关注滋养。",
        healing: "✅ 独处训练：每周安排半日"数字断食"，不分享不展示。\n✅ 内在价值：记录非外貌相关的三个优点（如"我很体贴"）。\n🌿 推荐植物：向日葵（温暖但不依赖阳光）、芍药（培养内在美）。"
    },
    ENFP: {
        plant: "蒲公英",
        description: "激发者：自由革命，-20℃至40℃，种子御风飞行。成长誓约：不被定义的灵魂，把远方变成新的故乡。",
        analysis: "你像蒲公英般自由不羁，种子能随风探索新大陆。思维跳跃充满创意，但难以持续专注。常常同时开启多个项目，却很少坚持到收获季节。",
        healing: "✅ 聚焦练习：选择一件小事持续21天（如晨间日记）。\n✅ 落地生根：将灵感转化为三步行动计划。\n🌿 推荐植物：蒲公英（保持冒险精神）、迷迭香（增强专注力）。"
    },
    ENTP: {
        plant: "猴面包树",
        description: "发明家：荒诞智慧，树干储水20吨，花朵夜间绽放。创新宣言：在不可能之处，建立属于自己的诺亚方舟。",
        analysis: "你是猴面包树般的创新者，能在荒漠中创造生存奇迹。热爱智力游戏和头脑风暴，但可能为了辩论而辩论。夜间开花的特性暗示你常在他人休息时灵感迸发。",
        healing: "✅ 建设性质疑：提出问题时附带一个解决方案。\n✅ 专注创造：将辩论能量转化为实际作品（如写文章）。\n🌿 推荐植物：猴面包树（保持独特性）、跳舞草（培养灵活性）。"
    },
    ESTJ: {
        plant: "橡树",
        description: "管理者：生态权威，年轮铭刻秩序，橡果哺育森林。领导哲学：真正的强大，是让整个生态系统因你繁荣。",
        analysis: "你如橡树般威严可靠，年轮记载着丰富的经验法则。善于建立高效系统，但可能过度强调"应该"而缺乏变通。像橡果滋养森林一样，你通过指导他人获得满足。",
        healing: "✅ 柔性领导：尝试一次不设KPI的团队活动。\n✅ 接纳新法：学习年轻人的某个习惯（如使用新APP）。\n🌿 推荐植物：橡树（保持核心力量）、吊兰（学习垂倾听）。"
    },
    ESFJ: {
        plant: "向日葵",
        description: "组织者：光明契约，智能追光系统，花盘由千朵小花构成。社交艺术：永远面朝太阳，把温暖折射给每个角落。",
        analysis: "你是向日葵般的温暖存在，天生懂得调节角度照耀每个角落。花盘由无数小花组成的特性，显示你擅长整合各方需求。但可能因过度照顾他人而忽略自己。",
        healing: "✅ 自我滋养：每天留出"不服务他人"的专属时间。\n✅ 适度距离：练习在帮助前先问"你需要什么"。\n🌿 推荐植物：向日葵（保持积极）、金盏花（设立界限）。"
    },
    ENFJ: {
        plant: "榕树",
        description: "教育家：共生奇迹，气根成林，独木庇护300+物种。成长密码：让每个依附者最终都成为支撑你的力量。",
        analysis: "你如榕树般包容智慧，气根落地即成新干。天生具备导师气质，能看到他人潜力。但可能过度介入他人成长，或为学生的停滞而焦虑。",
        healing: "✅ 信任练习：观察植物自主生长，不过度干预。\n✅ 能量保护：可视化树冠范围，区分"可影响区"与"放手区"。\n🌿 推荐植物：榕树（保持影响力）、薄荷（清新界限）。"
    },
    ENTJ: {
        plant: "竹子",
        description: "指挥官：爆发宣言，地下茎潜伏5年+单日生长1米。战略美学：沉默期的深度，决定破土时的高度。",
        analysis: "你是竹子般的战略大师，地下茎数年蛰伏只为爆发式成长。目标导向且执行力强，但可能因追求效率而忽视过程之美。像竹节划分阶段一样，你的人生充满清晰里程碑。",
        healing: "✅ 过程欣赏：记录每日小进步，不只关注大目标。\n✅ 柔和权威：尝试一次没有议程的团队聚会。\n🌿 推荐植物：竹子（保持成长性）、文竹（培养优雅从容）。"
    }
};

// 初始化测试
let currentQuestion = 0;
let answers = {
    E: 0, I: 0,
    S: 0, N: 0,
    T: 0, F: 0,
    J: 0, P: 0
};

// 渲染问题
function renderQuestion() {
    const questionsDiv = document.getElementById('questions');
    questionsDiv.innerHTML = '';

    questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = `question ${index === currentQuestion ? 'active' : ''}`;
        
        questionDiv.innerHTML = `
            <h3>问题 ${index + 1}：${q.question}</h3>
            <div class="options">
                ${q.options.map((option, optIndex) => `
                    <div class="option" onclick="selectOption(${index}, ${optIndex})">
                        ${option.text}
                    </div>
                `).join('')}
            </div>
        `;
        
        questionsDiv.appendChild(questionDiv);
    });
}

// 选择选项
function selectOption(questionIndex, optionIndex) {
    const options = document.querySelectorAll(`.question:nth-child(${questionIndex + 1}) .option`);
    options.forEach(opt => opt.classList.remove('selected'));
    options[optionIndex].classList.add('selected');

    // 更新答案
    const selectedOption = questions[questionIndex].options[optionIndex];
    Object.entries(selectedOption.dimensions).forEach(([dimension, value]) => {
        answers[dimension] += value;
    });

    // 自动进入下一题
    setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            renderQuestion();
        } else {
            showResult();
        }
    }, 500);
}

// 显示结果
function showResult() {
    const resultContainer = document.getElementById('resultContainer');
    const questionContainer = document.getElementById('questionContainer');
    
    // 计算每个维度的得分
    const scores = {
        E: answers.E,
        I: answers.I,
        S: answers.S,
        N: answers.N,
        T: answers.T,
        F: answers.F,
        J: answers.J,
        P: answers.P
    };
    
    // 确定人格类型
    const type = [
        scores.E > scores.I ? 'E' : 'I',
        scores.S > scores.N ? 'S' : 'N',
        scores.T > scores.F ? 'T' : 'F',
        scores.J > scores.P ? 'J' : 'P'
    ].join('');
    
    // 获取对应的人格类型信息
    const personality = personalityTypes[type];
    
    // 显示结果
    document.getElementById('personality-type').textContent = personality.plant;
    document.getElementById('personality-description').textContent = personality.description;
    
    // 显示结果页面
    questionContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    
    // 重置测试状态
    currentQuestion = 0;
    answers = {
        E: 0,
        I: 0,
        S: 0,
        N: 0,
        T: 0,
        F: 0,
        J: 0,
        P: 0
    };
}

// 翻页功能
function nextPage() {
    const currentPage = document.querySelector('.result-page.active');
    const nextPage = currentPage.nextElementSibling;
    if (nextPage) {
        currentPage.classList.remove('active');
        nextPage.classList.add('active');
        updatePageIndicator();
    }
}

function prevPage() {
    const currentPage = document.querySelector('.result-page.active');
    const prevPage = currentPage.previousElementSibling;
    if (prevPage) {
        currentPage.classList.remove('active');
        prevPage.classList.add('active');
        updatePageIndicator();
    }
}

function updatePageIndicator() {
    const currentPage = document.querySelector('.result-page.active');
    const pageNumber = parseInt(currentPage.dataset.page);
    const totalPages = document.querySelectorAll('.result-page').length;
    document.querySelector('.page-indicator').textContent = `${pageNumber}/${totalPages}`;
}

// 初始化页面
window.onload = renderQuestion; 