document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startButton');
    const videoContainer = document.getElementById('videoContainer');
    const beginVideo = document.getElementById('beginVideo');
    const blackScreen = document.getElementById('blackScreen');
    const centerText = document.querySelector('.center-text');
    const insideContainer = document.getElementById('insideContainer');
    const insideVideo = document.getElementById('insideVideo');
    const textLines = document.querySelectorAll('.text-line');
    const interactionHint = document.querySelector('.interaction-hint');
    const hintText = document.querySelector('.hint-text');
    const paperContainer = document.getElementById('paperContainer');
    const paperImage = document.querySelector('.paper-image');
    const paperContent = document.querySelector('.paper-content');
    const clickableText = document.querySelector('.highlight-text.clickable');

    // 创建音频元素
    const rainAudio = new Audio('rain.mp3');
    const stepAudio = new Audio('step.mp3');
    const glassAudio = new Audio('glass.mp3');
    const openAudio = new Audio('open.mp3');
    const pageAudio = new Audio('page.mp3');
    glassAudio.loop = true; // 设置glass音频循环播放

    // 设置统一的音量大小（0.0 到 1.0 之间）
    const volume = 0.5; // 设置为中等音量
    rainAudio.volume = volume;
    stepAudio.volume = volume * 0.6; // step音频音量降低到rain的60%
    glassAudio.volume = volume;
    openAudio.volume = volume * 1.5; // open音频音量增加到rain的150%
    pageAudio.volume = volume;

    // 设置视频静音
    beginVideo.muted = true;
    insideVideo.muted = true;

    // 创建摄像头容器并添加到页面
    const cameraContainer = document.createElement('div');
    cameraContainer.id = 'cameraContainer';
    cameraContainer.style.cssText = `
        position: fixed;
        left: 20px;
        bottom: 20px;
        width: 200px;
        height: 150px;
        background: rgba(0, 0, 0, 0.8);
        border: 2px solid #fff;
        border-radius: 10px;
        overflow: hidden;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    document.body.appendChild(cameraContainer);

    // 添加交互提示框
    const gestureHintBox = document.createElement('div');
    gestureHintBox.id = 'gestureHintBox';
    gestureHintBox.style.cssText = `
        position: fixed;
        left: 20px;
        bottom: 180px;
        width: 200px;
        min-height: 40px;
        background: rgba(0, 0, 0, 0.8);
        color: #CCCCCC;
        border: 1px solid #888888;
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 20px;
        font-weight: bold;
        text-align: center;
        z-index: 10000;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        font-family: 'Type', 'Microsoft YaHei', sans-serif;
    `;
    gestureHintBox.textContent = '准备手势交互...';
    document.body.appendChild(gestureHintBox);

    // 添加摄像头视频元素
    const cameraVideo = document.createElement('video');
    cameraVideo.id = 'cameraVideo';
    cameraVideo.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform: scaleX(-1);
    `;
    cameraVideo.autoplay = true;
    cameraVideo.playsInline = true;
    cameraContainer.appendChild(cameraVideo);

    // 添加画布元素用于绘制手部关键点
    const handCanvas = document.createElement('canvas');
    handCanvas.id = 'handCanvas';
    handCanvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform: scaleX(-1);
    `;
    cameraContainer.appendChild(handCanvas);

    // 添加状态指示器
    const statusIndicator = document.createElement('div');
    statusIndicator.id = 'statusIndicator';
    statusIndicator.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        width: 10px;
        height: 10px;
        background: red;
        border-radius: 50%;
        z-index: 10000;
    `;
    cameraContainer.appendChild(statusIndicator);

    // 初始化摄像头
    async function initCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user'
                }
            });
            cameraVideo.srcObject = stream;
            statusIndicator.style.background = 'green';
            console.log('摄像头初始化成功');
            
            // 初始化MediaPipe
            initMediaPipe();
        } catch (error) {
            console.error('摄像头初始化失败:', error);
            statusIndicator.style.background = 'red';
        }
    }

    // 初始化MediaPipe手势识别
    function initMediaPipe() {
        console.log('开始初始化MediaPipe...');
        
        if (typeof Hands === 'undefined') {
            console.error('MediaPipe Hands未加载');
            statusIndicator.style.background = 'red';
            return;
        }

        if (typeof Camera === 'undefined') {
            console.error('MediaPipe Camera未加载');
            statusIndicator.style.background = 'red';
            return;
        }

        try {
            const hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`;
                }
            });

            hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            console.log('MediaPipe Hands配置完成');

            // 手势识别结果处理
            hands.onResults((results) => {
                const ctx = handCanvas.getContext('2d');
                handCanvas.width = cameraVideo.videoWidth;
                handCanvas.height = cameraVideo.videoHeight;
                
                // 清除画布
                ctx.clearRect(0, 0, handCanvas.width, handCanvas.height);
                
                // 如果检测到手部，绘制关键点
                if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                    for (const landmarks of results.multiHandLandmarks) {
                        // 绘制手部连接线
                        if (typeof drawConnectors !== 'undefined' && typeof HAND_CONNECTIONS !== 'undefined') {
                            drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 2});
                            drawLandmarks(ctx, landmarks, {color: '#FF0000', lineWidth: 1});
                        }
                        
                        // 检测手势
                        detectGestures(landmarks);
                    }
                    
                    // 更新状态指示器为蓝色表示检测到手部
                    statusIndicator.style.background = 'blue';
                } else {
                    // 没有检测到手部时重置翻页计时器
                    resetPageTurnTimer();
                    // 没有检测到手部时保持绿色
                    statusIndicator.style.background = 'green';
                }
            });

            // 启动摄像头处理
            const camera = new Camera(cameraVideo, {
                onFrame: async () => {
                    try {
                        await hands.send({image: cameraVideo});
                    } catch (error) {
                        console.error('发送帧到MediaPipe失败:', error);
                    }
                },
                width: 640,
                height: 480
            });
            
            camera.start().then(() => {
                console.log('MediaPipe摄像头启动成功');
                statusIndicator.style.background = 'green';
            }).catch(error => {
                console.error('MediaPipe摄像头启动失败:', error);
                statusIndicator.style.background = 'red';
            });

            console.log('MediaPipe手势识别初始化成功');
        } catch (error) {
            console.error('MediaPipe初始化失败:', error);
            statusIndicator.style.background = 'red';
        }
    }

    // 手势检测函数
    function detectGestures(landmarks) {
        // 获取手部关键点
        const indexFinger = landmarks[8]; // 食指指尖
        const indexFingerMCP = landmarks[5]; // 食指根部
        const middleFinger = landmarks[12]; // 中指指尖
        const middleFingerMCP = landmarks[9]; // 中指根部
        const ringFinger = landmarks[16]; // 无名指指尖
        const ringFingerMCP = landmarks[13]; // 无名指根部
        const pinky = landmarks[20]; // 小指指尖
        const pinkyMCP = landmarks[17]; // 小指根部
        const thumb = landmarks[4]; // 拇指指尖
        const thumbMCP = landmarks[1]; // 拇指根部

        // 检测点击手势（食指伸直，其他手指握拳）
        const isIndexFingerUp = indexFinger.y < indexFingerMCP.y - 0.02;
        const isMiddleFingerDown = middleFinger.y > middleFingerMCP.y + 0.01;
        const isRingFingerDown = ringFinger.y > ringFingerMCP.y + 0.01;
        const isPinkyDown = pinky.y > pinkyMCP.y + 0.01;
        const isThumbDown = thumb.y > thumbMCP.y;

        // 检测翻页手势（所有手指都伸直）
        const isIndexFingerStraight = indexFinger.y < indexFingerMCP.y - 0.02;
        const isMiddleFingerStraight = middleFinger.y < middleFingerMCP.y - 0.02;
        const isRingFingerStraight = ringFinger.y < ringFingerMCP.y - 0.02;
        const isPinkyStraight = pinky.y < pinkyMCP.y - 0.02;
        const isThumbStraight = Math.abs(thumb.x - thumbMCP.x) > 0.03; // 拇指横向伸直

        // 检测捏起手势（拇指、食指、中指指尖接触）
        const thumbIndexDistance = Math.hypot(thumb.x - indexFinger.x, thumb.y - indexFinger.y);
        const thumbMiddleDistance = Math.hypot(thumb.x - middleFinger.x, thumb.y - middleFinger.y);
        const indexMiddleDistance = Math.hypot(indexFinger.x - middleFinger.x, indexFinger.y - middleFinger.y);
        
        const isPinchGesture = thumbIndexDistance < 0.05 && thumbMiddleDistance < 0.05 && indexMiddleDistance < 0.05;

        // 检测抓取手势（五指分开然后握拳）
        const allFingersSpread = isIndexFingerStraight && isMiddleFingerStraight && isRingFingerStraight && isPinkyStraight && isThumbStraight;
        const allFingersClosed = !isIndexFingerStraight && !isMiddleFingerStraight && !isRingFingerStraight && !isPinkyStraight;

        // 检测拖拽手势（握拳状态） - 改进判断逻辑
        const isFist = !isIndexFingerStraight && !isMiddleFingerStraight && !isRingFingerStraight && !isPinkyStraight && 
                       indexFinger.y > indexFingerMCP.y && middleFinger.y > middleFingerMCP.y;

        // 在画布上显示调试信息
        const ctx = handCanvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        
        // 显示手指状态
        ctx.fillText(`食指: ${isIndexFingerUp ? '竖起' : '弯曲'}`, 5, 15);
        ctx.fillText(`中指: ${isMiddleFingerDown ? '弯曲' : '伸直'}`, 5, 25);
        ctx.fillText(`无名指: ${isRingFingerDown ? '弯曲' : '伸直'}`, 5, 35);
        ctx.fillText(`小指: ${isPinkyDown ? '弯曲' : '伸直'}`, 5, 45);
        ctx.fillText(`拇指: ${isThumbDown ? '弯曲' : '伸直'}`, 5, 55);
        
        // 显示手势识别状态
        const isClickGesture = isIndexFingerUp && isMiddleFingerDown && isRingFingerDown && isPinkyDown;
        const isPageTurnGesture = isIndexFingerStraight && isMiddleFingerStraight && isRingFingerStraight && isPinkyStraight && isThumbStraight;
        
        ctx.fillText(`点击手势: ${isClickGesture ? '✓' : '✗'}`, 5, 70);
        ctx.fillText(`翻页手势: ${isPageTurnGesture ? '✓' : '✗'}`, 5, 80);
        ctx.fillText(`捏起手势: ${isPinchGesture ? '✓' : '✗'}`, 5, 90);
        ctx.fillText(`抓取手势: ${allFingersSpread ? '张开' : allFingersClosed ? '握拳' : '---'}`, 5, 100);
        ctx.fillText(`拖拽手势: ${isFist ? '✓' : '✗'}`, 5, 110);

        // 点击手势检测
        if (isClickGesture) {
            console.log('检测到点击手势');
            handleClickGesture();
        }

        // 翻页手势检测
        if (isPageTurnGesture) {
            console.log('检测到翻页手势');
            handlePageTurnGesture();
        }

        // 捏起手势检测
        if (isPinchGesture) {
            handlePinchGesture(landmarks);
        }

        // 抓取手势检测
        if (allFingersSpread) {
            handleGrabGestureStart();
        } else if (allFingersClosed && grabGestureStarted) {
            handleGrabGestureComplete();
        }

        // 拖拽手势检测
        if (isFist) {
            handleDragGesture(landmarks);
        } else if (isDragging) {
            // 如果不再是握拳状态，重置拖拽
            console.log('握拳状态结束，重置拖拽');
            isDragging = false;
            dragStartPosition = null;
        }
    }

    // 手势状态追踪变量
    let lastClickTime = 0;
    let pageTurnStartTime = null;
    let lastPageTurnTime = 0;
    let pinchStartTime = null;
    let pinchStartY = null;
    let lastPinchTime = 0;
    let grabGestureStarted = false;
    let grabStartTime = null;
    let lastGrabTime = 0;
    let dragStartPosition = null;
    let isDragging = false;
    let lastDragTime = 0;

    // 处理点击手势
    function handleClickGesture() {
        const currentTime = Date.now();
        // 防止重复触发，至少间隔1秒
        if (currentTime - lastClickTime < 1000) return;

        console.log('正在处理点击手势...');

        // 检查当前页面状态并触发相应按钮
        const startButton = document.getElementById('startButton');
        const blackScreen = document.getElementById('blackScreen');
        const startCraftButton = document.querySelector('.start-craft-button');

        console.log('开始按钮状态:', startButton?.style.display, startButton?.classList.contains('gesture-clicked'));
        console.log('黑屏状态:', blackScreen?.classList.contains('show'), blackScreen?.classList.contains('gesture-clicked'));
        console.log('制作按钮状态:', startCraftButton?.offsetParent !== null, startCraftButton?.classList.contains('gesture-clicked'));

        if (startButton && startButton.style.display !== 'none' && !startButton.classList.contains('gesture-clicked')) {
            // 开始页面的开始体验按钮
            console.log('触发开始体验按钮');
            triggerButtonClick(startButton, '开始体验');
            lastClickTime = currentTime;
        } else if (blackScreen && blackScreen.classList.contains('show') && !blackScreen.classList.contains('gesture-clicked')) {
            // 黑屏页面的"你决定进店里看看"
            console.log('触发黑屏点击');
            triggerScreenClick(blackScreen, '进入店铺');
            lastClickTime = currentTime;
        } else if (startCraftButton && startCraftButton.offsetParent !== null && !startCraftButton.classList.contains('gesture-clicked')) {
            // 牛皮纸页面的开始制作按钮
            console.log('触发开始制作按钮');
            triggerButtonClick(startCraftButton, '开始制作');
            lastClickTime = currentTime;
        }
    }

    // 处理翻页手势（修改为3秒）
    function handlePageTurnGesture() {
        const currentTime = Date.now();
        
        // 开始计时
        if (!pageTurnStartTime) {
            pageTurnStartTime = currentTime;
            console.log('开始翻页手势计时');
            showGestureNotification('保持手掌张开...', '#FFD700');
            return;
        }

        // 显示倒计时（改为3秒）
        const remainingTime = 3 - Math.floor((currentTime - pageTurnStartTime) / 1000);
        if (remainingTime > 0) {
            showGestureNotification(`翻页倒计时: ${remainingTime}`, '#FFD700');
        }

        // 检查是否持续3秒（修改）
        if (currentTime - pageTurnStartTime >= 3000) {
            // 防止重复触发
            if (currentTime - lastPageTurnTime < 2000) return;

            console.log('翻页手势完成，检查当前页面状态');

            // 检查当前页面状态并执行翻页
            const testContainer = document.getElementById('testContainer');
            const resultContainer = document.getElementById('resultContainer');
            const paperPage = document.getElementById('paperPage');
            const healingPage = document.getElementById('healingPage');

            console.log('测试页面状态:', !testContainer?.classList.contains('hidden'));
            console.log('结果页面状态:', !resultContainer?.classList.contains('hidden'));
            console.log('报告页面状态:', !paperPage?.classList.contains('hidden'));
            console.log('疗愈页面状态:', !healingPage?.classList.contains('hidden'));

            if (testContainer && !testContainer.classList.contains('hidden')) {
                // 从测试页面翻到结果页面（需要完成测试）
                if (currentQuestionIndex >= questions.length) {
                    console.log('执行从测试完成到结果页面的翻页');
                    executePageTurn(() => showResult(), '翻到结果页面');
                    lastPageTurnTime = currentTime;
                }
            } else if (resultContainer && !resultContainer.classList.contains('hidden')) {
                // 从结果页面翻到个性报告页面
                console.log('执行从结果页面到个性报告的翻页');
                executePageTurn(() => goToPaper(), '翻到个性报告');
                lastPageTurnTime = currentTime;
            } else if (paperPage && !paperPage.classList.contains('hidden')) {
                // 从个性报告翻到疗愈方案页面
                console.log('执行从个性报告到疗愈方案的翻页');
                executePageTurn(() => goToHealing(), '翻到疗愈方案');
                lastPageTurnTime = currentTime;
            } else if (healingPage && !healingPage.classList.contains('hidden')) {
                // 从疗愈方案翻到植物认领阶段
                console.log('执行从疗愈方案到植物认领的翻页');
                executePageTurn(() => claimPlant(), '翻到植物认领');
                lastPageTurnTime = currentTime;
            }

            pageTurnStartTime = null;
        }
    }

    // 重置翻页计时器（当手势中断时）
    function resetPageTurnTimer() {
        if (pageTurnStartTime) {
            console.log('重置翻页计时器');
        }
        pageTurnStartTime = null;
    }

    // 触发按钮点击效果
    function triggerButtonClick(button, actionName) {
        // 添加手势点击标记
        button.classList.add('gesture-clicked');
        
        // 添加点击特效
        button.style.transform = 'scale(0.95)';
        button.style.background = 'rgba(255, 255, 255, 0.3)';
        button.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.5)';
        
        // 显示手势识别提示
        showGestureNotification(`${actionName} - 手势识别成功！`, '#00FF00');
        
        setTimeout(() => {
            // 执行实际点击
            button.click();
            
            // 移除特效
            button.style.transform = '';
            button.style.background = '';
            button.style.boxShadow = '';
            
            setTimeout(() => {
                button.classList.remove('gesture-clicked');
            }, 500);
        }, 200);
    }

    // 触发屏幕点击效果（黑屏页面）
    function triggerScreenClick(screen, actionName) {
        screen.classList.add('gesture-clicked');
        
        // 添加屏幕点击特效
        screen.style.background = 'rgba(50, 50, 50, 0.8)';
        screen.style.transform = 'scale(1.02)';
        
        showGestureNotification(`${actionName} - 手势识别成功！`, '#00FF00');
        
        setTimeout(() => {
            // 执行屏幕点击逻辑（直接触发黑屏结束）
            blackScreen.classList.remove('show');
            blackScreen.classList.add('hidden');
            
            insideContainer.classList.remove('hidden');
            insideContainer.classList.add('show');
            insideVideo.play();
            
            // 停止rain和open音频，开始播放glass音频
            rainAudio.pause();
            openAudio.pause();
            glassAudio.play();
            
            // 移除特效
            screen.style.background = '';
            screen.style.transform = '';
            
            setTimeout(() => {
                screen.classList.remove('gesture-clicked');
            }, 500);
        }, 200);
    }

    // 执行翻页动画（改为平滑效果）
    function executePageTurn(callback, actionName) {
        const currentPage = document.querySelector('.paper-container:not(.hidden), .video-page:not([style*="display: none"])');
        if (currentPage) {
            // 平滑淡出动画
            currentPage.style.transition = 'opacity 0.3s ease-out';
            currentPage.style.opacity = '0';
            
            showGestureNotification(`${actionName} - 翻页手势识别成功！`, '#FFD700');
            
            setTimeout(() => {
                // 执行页面切换
                callback();
                
                // 为新页面添加进入动画
                setTimeout(() => {
                    const newPage = document.querySelector('.paper-container:not(.hidden), .video-page:not([style*="display: none"])');
                    if (newPage) {
                        newPage.style.opacity = '0';
                        newPage.style.transition = 'opacity 0.3s ease-in';
                        
                        setTimeout(() => {
                            newPage.style.opacity = '1';
                        }, 50);
                        
                        setTimeout(() => {
                            newPage.style.transition = '';
                        }, 350);
                    }
                }, 50);
                
                // 重置原页面样式
                currentPage.style.transition = '';
                currentPage.style.opacity = '';
            }, 300);
        }
    }

    // 显示手势识别通知
    function showGestureNotification(message, color) {
        const ctx = handCanvas.getContext('2d');
        
        // 绘制通知背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, handCanvas.height - 60, handCanvas.width, 60);
        
        // 绘制通知文字
        ctx.fillStyle = color;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(message, handCanvas.width / 2, handCanvas.height - 30);
        
        // 2秒后清除通知
        setTimeout(() => {
            ctx.clearRect(0, handCanvas.height - 60, handCanvas.width, 60);
        }, 2000);
    }

    // 页面加载完成后初始化摄像头
    initCamera();

    // 添加按钮点击动画样式
    const style = document.createElement('style');
    style.textContent = `
        #startButton.clicked {
            transform: scale(0.95);
            transition: transform 0.1s ease;
        }
    `;
    document.head.appendChild(style);

    startButton.addEventListener('click', function() {
        startButton.style.display = 'none';
        videoContainer.classList.remove('hidden');
        videoContainer.classList.add('show');
        beginVideo.play();
        rainAudio.play(); // 播放rain音频
        
        // 2秒后播放step音频
        setTimeout(() => {
            stepAudio.play();
        }, 2000);

        // 第一行文字动画（右边的文字）
        setTimeout(() => {
            textLines[1].classList.add('show');
        }, 1000);

        // 第二行文字动画（左边的文字，5秒后）
        setTimeout(() => {
            textLines[0].classList.add('show');
        }, 6000);
    });

    beginVideo.addEventListener('ended', function() {
        // 淡出当前视频
        videoContainer.classList.remove('show');
        videoContainer.classList.add('hidden');
        
        // 显示黑屏
        blackScreen.classList.remove('hidden');
        blackScreen.classList.add('show');
        
        // 在黑屏时播放rain和open音频
        rainAudio.play();
        openAudio.play();
        
        // 显示中心文字
        setTimeout(() => {
            centerText.classList.add('show');
        }, 500);

        // 3秒后切换到inside视频
        setTimeout(() => {
            // 淡出黑屏
            blackScreen.classList.remove('show');
            blackScreen.classList.add('hidden');
            
            // 显示inside视频
            insideContainer.classList.remove('hidden');
            insideContainer.classList.add('show');
            insideVideo.play();
            
            // 停止rain和step音频，开始播放glass音频
            rainAudio.pause();
            stepAudio.pause();
            glassAudio.play();
        }, 3000);
    });

    insideVideo.addEventListener('play', function() {
        // 显示inside场景的文字
        setTimeout(() => {
            textLines[2].classList.add('show');
        }, 1000);

        setTimeout(() => {
            textLines[3].classList.add('show');
        }, 6000);

        setTimeout(() => {
            textLines[4].classList.add('show');
        }, 11000);

        // 在所有文字显示完毕后显示交互提示
        setTimeout(() => {
            interactionHint.classList.remove('hidden');
            interactionHint.classList.add('show');
            hintText.classList.add('show');
        }, 13000); // 确保在第三列文字显示后显示提示

        // 在交互提示显示后，添加点击事件监听器
        setTimeout(() => {
            // 为可点击文字添加点击事件
            clickableText.addEventListener('click', function() {
                showPaper();
            });

            // 为交互提示添加点击事件
            interactionHint.addEventListener('click', function() {
                showPaper();
            });
        }, 14000); // 确保在提示显示后添加点击事件
    });

    // 显示paper图片的函数
    function showPaper() {
        // 淡出inside容器
        insideContainer.classList.remove('show');
        insideContainer.classList.add('hidden');
        
        // 显示paper容器
        paperContainer.classList.remove('hidden');
        setTimeout(() => {
            paperContainer.classList.add('show');
            paperImage.classList.add('show');
            // 显示文字内容
            setTimeout(() => {
                paperContent.classList.add('show');
            }, 500);
        }, 50);
    }

    // 处理捏起手势
    function handlePinchGesture(landmarks) {
        const currentTime = Date.now();
        
        // 检查是否在inside页面且交互提示可见
        const insideContainer = document.getElementById('insideContainer');
        const interactionHint = document.querySelector('.interaction-hint');
        
        if (!insideContainer || insideContainer.classList.contains('hidden') || 
            !interactionHint || interactionHint.classList.contains('hidden')) {
            return;
        }

        // 防止重复触发
        if (currentTime - lastPinchTime < 2000) return;

        // 开始捏起计时
        if (!pinchStartTime) {
            pinchStartTime = currentTime;
            pinchStartY = (landmarks[4].y + landmarks[8].y + landmarks[12].y) / 3; // 三指平均Y位置
            console.log('开始捏起手势');
            return;
        }

        // 检查向上移动
        const currentY = (landmarks[4].y + landmarks[8].y + landmarks[12].y) / 3;
        const upwardMovement = pinchStartY - currentY;

        // 持续捏起0.5秒且有向上移动
        if (currentTime - pinchStartTime >= 500 && upwardMovement > 0.02) {
            console.log('捏起手势完成，触发牛皮纸拾起');
            
            // 添加牛皮纸微微上提效果
            const clickableText = document.querySelector('.highlight-text.clickable');
            if (clickableText) {
                clickableText.style.transition = 'transform 0.3s ease';
                clickableText.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    clickableText.style.transform = '';
                }, 300);
            }
            
            showGestureNotification('拾起牛皮纸 - 手势识别成功！', '#00FF00');
            
            setTimeout(() => {
                // 触发显示纸张
                showPaper();
            }, 400);
            
            lastPinchTime = currentTime;
            pinchStartTime = null;
        }
    }

    // 处理抓取手势开始
    function handleGrabGestureStart() {
        if (!grabGestureStarted) {
            const videoPage = document.getElementById('videoPage');
            const grabHint = document.querySelector('.grab-hint');
            
            // 检查是否在植物认领页面
            if (videoPage && videoPage.style.display === 'flex' && 
                grabHint && !grabHint.classList.contains('hidden')) {
                
                grabGestureStarted = true;
                grabStartTime = Date.now();
                console.log('抓取手势开始 - 手掌张开');
                
                showGestureNotification('手掌张开，握拳完成抓取', '#FFA500');
            }
        }
    }

    // 处理抓取手势完成
    function handleGrabGestureComplete() {
        if (grabGestureStarted && grabStartTime) {
            const currentTime = Date.now();
            
            // 防止重复触发
            if (currentTime - lastGrabTime < 3000) return;
            
            // 手势持续时间检查
            if (currentTime - grabStartTime >= 300) {
                console.log('抓取手势完成 - 握拳');
                
                // 触发抓取玻璃瓶效果
                const videoPage = document.getElementById('videoPage');
                const event = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    clientX: window.innerWidth / 2,
                    clientY: window.innerHeight / 2
                });
                
                videoPage.dispatchEvent(event);
                
                showGestureNotification('抓取玻璃瓶 - 手势识别成功！', '#00FF00');
                
                lastGrabTime = currentTime;
            }
            
            grabGestureStarted = false;
            grabStartTime = null;
        }
    }

    // 处理拖拽手势
    function handleDragGesture(landmarks) {
        const currentTime = Date.now();
        
        // 检查是否有植物图片容器
        const imageContainer = document.querySelector('.plant-image-container');
        if (!imageContainer || imageContainer.classList.contains('disappear')) {
            isDragging = false;
            dragStartPosition = null;
            return;
        }

        // 防止重复触发
        if (currentTime - lastDragTime < 800) return;

        // 计算手部中心位置（使用更稳定的关键点）
        const handCenter = {
            x: (landmarks[5].x + landmarks[9].x + landmarks[13].x + landmarks[17].x) / 4, // 使用手指根部关键点
            y: (landmarks[5].y + landmarks[9].y + landmarks[13].y + landmarks[17].y) / 4
        };

        if (!isDragging) {
            // 开始拖拽
            dragStartPosition = handCenter;
            isDragging = true;
            console.log('开始拖拽手势，起始位置:', dragStartPosition);
            
            // 在画布上显示拖拽开始提示
            const ctx = handCanvas.getContext('2d');
            ctx.fillStyle = 'orange';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('握拳向右拖拽...', handCanvas.width / 2, handCanvas.height / 2 - 20);
            return;
        }

        // 检查向右移动距离（降低阈值，提高灵敏度）
        const rightMovement = handCenter.x - dragStartPosition.x;
        
        // 在画布上显示实时移动距离
        const ctx = handCanvas.getContext('2d');
        ctx.fillStyle = 'yellow';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`向右移动: ${(rightMovement * 100).toFixed(1)}%`, 5, 130);
        
        if (rightMovement > 0.08) { // 降低阈值从0.15到0.08，提高灵敏度
            console.log('向右拖拽手势完成，移动距离:', rightMovement);
            
            // 触发图片消失效果
            const event = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            
            imageContainer.dispatchEvent(event);
            
            showGestureNotification('向右拖拽 - 手势识别成功！', '#00FF00');
            
            lastDragTime = currentTime;
            isDragging = false;
            dragStartPosition = null;
        }
    }

    // 语音识别相关变量
    let recognition = null;
    let isVoiceRecognitionActive = false;

    // 初始化语音识别
    function initVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'zh-CN';
            
            recognition.onresult = function(event) {
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        const transcript = event.results[i][0].transcript.toLowerCase();
                        console.log('语音识别结果:', transcript);
                        handleVoiceCommand(transcript);
                    }
                }
            };
            
            recognition.onerror = function(event) {
                console.error('语音识别错误:', event.error);
            };
            
            recognition.onend = function() {
                // 如果在测试页面且需要继续监听，重新开始
                if (isVoiceRecognitionActive) {
                    setTimeout(() => {
                        try {
                            recognition.start();
                        } catch (error) {
                            console.log('重新启动语音识别');
                        }
                    }, 100);
                }
            };
            
            console.log('语音识别初始化成功');
        } else {
            console.log('浏览器不支持语音识别');
        }
    }

    // 处理语音命令
    function handleVoiceCommand(transcript) {
        // 检查是否在测试页面
        const testContainer = document.getElementById('testContainer');
        if (!testContainer || testContainer.classList.contains('hidden')) {
            return;
        }

        // 检测数字1、2、3 - 改进识别逻辑
        console.log('原始语音文本:', transcript);
        
        let optionIndex = -1;
        
        // 优先检查明确的数字表达
        if (transcript.includes('第一') || transcript.includes('选一') || transcript.includes('选1') || 
            transcript.includes('第1') || transcript.includes('一号') || transcript.includes('1号')) {
            optionIndex = 0;
        } else if (transcript.includes('第二') || transcript.includes('选二') || transcript.includes('选2') || 
                   transcript.includes('第2') || transcript.includes('二号') || transcript.includes('2号')) {
            optionIndex = 1;
        } else if (transcript.includes('第三') || transcript.includes('选三') || transcript.includes('选3') || 
                   transcript.includes('第3') || transcript.includes('三号') || transcript.includes('3号')) {
            optionIndex = 2;
        } else {
            // 如果没有明确表达，再检查单独的数字
            const numbers = transcript.match(/[一二三123]/g);
            if (numbers && numbers.length > 0) {
                const lastNumber = numbers[numbers.length - 1];
                switch(lastNumber) {
                    case '1':
                    case '一':
                        // 额外检查避免误识别
                        if (!transcript.includes('十一') && !transcript.includes('二十一')) {
                            optionIndex = 0;
                        }
                        break;
                    case '2':
                    case '二':
                        // 额外检查避免误识别
                        if (!transcript.includes('十二') && !transcript.includes('二十二')) {
                            optionIndex = 1;
                        }
                        break;
                    case '3':
                    case '三':
                        // 额外检查避免误识别
                        if (!transcript.includes('十三') && !transcript.includes('二十三')) {
                            optionIndex = 2;
                        }
                        break;
                }
            }
        }
        
        if (optionIndex >= 0) {
            console.log('语音选择选项:', optionIndex + 1);
            selectVoiceOption(optionIndex);
        }
    }

    // 语音选择选项
    function selectVoiceOption(optionIndex) {
        const options = document.querySelectorAll('.option');
        if (options[optionIndex]) {
            // 添加语音选择效果
            options[optionIndex].style.background = 'rgba(255, 215, 0, 0.3)';
            options[optionIndex].style.transform = 'scale(1.05)';
            
            // 显示语音识别成功提示
            updateGestureHint('语音识别成功！');
            
            setTimeout(() => {
                // 触发点击
                options[optionIndex].click();
                
                // 移除效果
                options[optionIndex].style.background = '';
                options[optionIndex].style.transform = '';
            }, 300);
        }
    }

    // 启动语音识别
    function startVoiceRecognition() {
        if (recognition && !isVoiceRecognitionActive) {
            try {
                recognition.start();
                isVoiceRecognitionActive = true;
                console.log('语音识别已启动');
            } catch (error) {
                console.log('语音识别启动失败:', error);
            }
        }
    }

    // 停止语音识别
    function stopVoiceRecognition() {
        if (recognition && isVoiceRecognitionActive) {
            recognition.stop();
            isVoiceRecognitionActive = false;
            console.log('语音识别已停止');
        }
    }

    // 更新手势提示
    function updateGestureHint(message) {
        gestureHintBox.textContent = message;
        gestureHintBox.style.background = 'rgba(100, 200, 100, 0.8)';
        gestureHintBox.style.color = '#000';
        
        setTimeout(() => {
            gestureHintBox.style.background = 'rgba(0, 0, 0, 0.8)';
            gestureHintBox.style.color = '#CCCCCC';
            checkCurrentPageAndUpdateHint();
        }, 2000);
    }

    // 检查当前页面并更新提示
    function checkCurrentPageAndUpdateHint() {
        const startButton = document.getElementById('startButton');
        const blackScreen = document.getElementById('blackScreen');
        const insideContainer = document.getElementById('insideContainer');
        const testContainer = document.getElementById('testContainer');
        const resultContainer = document.getElementById('resultContainer');
        const paperPage = document.getElementById('paperPage');
        const healingPage = document.getElementById('healingPage');
        const videoPage = document.getElementById('videoPage');
        const interactionHint = document.querySelector('.interaction-hint');
        const grabHint = document.querySelector('.grab-hint');
        const imageContainer = document.querySelector('.plant-image-container');
        const paperContainer = document.getElementById('paperContainer');

        // 检查是否在测试页面，控制语音识别
        if (testContainer && !testContainer.classList.contains('hidden')) {
            if (!isVoiceRecognitionActive) {
                startVoiceRecognition();
            }
        } else {
            if (isVoiceRecognitionActive) {
                stopVoiceRecognition();
            }
        }

        // 优化页面检测逻辑，按照最明确的状态优先判断
        
        // 1. 植物认领页面 - 拖拽阶段（最高优先级）
        if (imageContainer && !imageContainer.classList.contains('disappear') && 
            videoPage && videoPage.style.display === 'flex') {
            gestureHintBox.textContent = '拳头向右移动';
        }
        // 2. 植物认领页面 - 抓取阶段
        else if (videoPage && videoPage.style.display === 'flex' && 
                 grabHint && !grabHint.classList.contains('hidden')) {
            gestureHintBox.textContent = '抓取';
        }
        // 3. 测试页面
        else if (testContainer && !testContainer.classList.contains('hidden')) {
            gestureHintBox.textContent = '说出选项1/2/3';
        }
        // 4. 结果页面
        else if (resultContainer && !resultContainer.classList.contains('hidden')) {
            gestureHintBox.textContent = '说出选项1/2/3';
        }
        // 5. 报告页面
        else if (paperPage && !paperPage.classList.contains('hidden')) {
            gestureHintBox.textContent = '说出选项1/2/3';
        }
        // 6. 疗愈页面
        else if (healingPage && !healingPage.classList.contains('hidden')) {
            gestureHintBox.textContent = '说出选项1/2/3';
        }
        // 7. 牛皮纸容器页面（开始制作按钮）
        else if (paperContainer && !paperContainer.classList.contains('hidden')) {
            gestureHintBox.textContent = '点击';
        }
        // 8. inside页面 - 牛皮纸交互
        else if (insideContainer && !insideContainer.classList.contains('hidden') && 
                 interactionHint && !interactionHint.classList.contains('hidden')) {
            gestureHintBox.textContent = '捏起来';
        }
        // 9. 黑屏页面
        else if (blackScreen && blackScreen.classList.contains('show')) {
            gestureHintBox.textContent = '点击';
        }
        // 10. 开始页面
        else if (startButton && startButton.style.display !== 'none' && 
                 !startButton.classList.contains('hidden')) {
            gestureHintBox.textContent = '点击';
        }
        // 默认状态
        else {
            gestureHintBox.textContent = '准备手势交互...';
        }
    }

    // 页面加载完成后初始化
    initCamera();
    initVoiceRecognition();
    
    // 定期检查页面状态并更新提示
    setInterval(checkCurrentPageAndUpdateHint, 1000);

    // 添加植物认领页面事件处理
    const videoPage = document.getElementById('videoPage');
    if (videoPage) {
        videoPage.addEventListener('click', function(e) {
            const grabHint = document.querySelector('.grab-hint');
            if (!grabHint.classList.contains('hidden')) {
                console.log("点击事件触发");
                
                // 获取测试结果
                const personalityType = document.getElementById('personality-type');
                console.log("测试结果元素:", personalityType);
                
                if (!personalityType) {
                    console.log("未找到测试结果元素");
                    return;
                }
                
                const resultContent = personalityType.textContent;
                console.log("测试结果内容:", resultContent);
                
                // 创建图片容器
                const imageContainer = document.createElement('div');
                imageContainer.className = 'plant-image-container';

                // 创建图片元素
                const plantImage = document.createElement('img');
                
                // 根据测试结果显示对应图片
                let plantImageName = '';
                if (resultContent.includes('向日葵')) {
                    plantImageName = '向日葵.png';
                } else if (resultContent.includes('榕树')) {
                    plantImageName = '榕树.png';
                } else if (resultContent.includes('竹子')) {
                    plantImageName = '竹子.png';
                } else if (resultContent.includes('樱花')) {
                    plantImageName = '樱花.png';
                } else if (resultContent.includes('银杏')) {
                    plantImageName = '银杏.png';
                } else if (resultContent.includes('雪松')) {
                    plantImageName = '雪松.png';
                } else if (resultContent.includes('蓝花楹')) {
                    plantImageName = '蓝花楹.png';
                } else if (resultContent.includes('红杉')) {
                    plantImageName = '红杉.png';
                } else if (resultContent.includes('凤凰木')) {
                    plantImageName = '凤凰木.png';
                } else if (resultContent.includes('白桦')) {
                    plantImageName = '白桦.png';
                } else if (resultContent.includes('蒲公英')) {
                    plantImageName = '蒲公英.png';
                } else if (resultContent.includes('菩提树')) {
                    plantImageName = '菩提树.png';
                } else if (resultContent.includes('木绣球')) {
                    plantImageName = '木绣球.png';
                } else if (resultContent.includes('牡丹')) {
                    plantImageName = '牡丹.png';
                } else if (resultContent.includes('猴面包树')) {
                    plantImageName = '猴面包树.png';
                } else if (resultContent.includes('橡树')) {
                    plantImageName = '橡树.png';
                }
                
                console.log("选择的图片:", plantImageName);
                
                if (!plantImageName) {
                    console.log("未找到匹配的植物图片");
                    return;
                }
                
                plantImage.src = `./images/${plantImageName}`;
                plantImage.className = 'plant-image';
                
                // 添加图片到容器
                imageContainer.appendChild(plantImage);
                
                // 添加文字说明
                const plantText = document.createElement('div');
                plantText.style.cssText = `
                    color: #2c1810;
                    font-size: 18px;
                    text-align: center;
                    margin-top: 10px;
                    font-family: 'Type', 'Microsoft YaHei', sans-serif;
                    text-shadow: 0 0 3px rgba(255, 255, 255, 0.5);
                `;
                plantText.textContent = '这是属于你的植物标本，请好好珍惜';
                imageContainer.appendChild(plantText);
                
                // 添加容器到页面
                videoPage.appendChild(imageContainer);
                
                // 隐藏提示
                grabHint.classList.add('hidden');
                
                // 添加图片动画
                setTimeout(() => {
                    imageContainer.classList.add('active');
                }, 100);
            } else {
                // 检查是否点击了图片容器
                const imageContainer = document.querySelector('.plant-image-container');
                if (imageContainer && e.target.closest('.plant-image-container')) {
                    // 添加消失动画类
                    imageContainer.classList.add('disappear');
                    
                    // 等待动画完成后切换视频
                    setTimeout(() => {
                        // 移除图片容器
                        imageContainer.remove();
                        
                        // 停顿一下再切换视频
                        setTimeout(() => {
                            // 切换视频
                            const deskVideo = document.getElementById('deskVideo');
                            const lightVideo = document.createElement('video');
                            lightVideo.id = 'lightVideo';
                            lightVideo.src = 'light.mp4';
                            lightVideo.style.cssText = `
                                position: fixed;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                object-fit: cover;
                                z-index: 1000;
                                opacity: 0;
                                transition: opacity 2s ease;
                            `;
                            
                            // 新增：light视频结束后显示文字的容器
                            let lightTextContainer = document.createElement('div');
                            lightTextContainer.className = 'light-text-container hidden';
                            let text = `
                              <span class="highlight">亲爱的你：</span><br>
                              专属植物只是你的一面镜子，而非全部的定义。<br>
                              真正的你，远比一种颜色、一种姿态更辽阔。<br>
                              你本就是一片生生不息、永远在成长的森林。<br>
                            `;
                            text = text.replace(/。/g, '。<br>'); // 每个句号后换行
                            lightTextContainer.innerHTML = `<div class="light-text-content"><p class="light-text-p" id="light-text-1">${text}</p></div>`;
                            videoPage.appendChild(lightTextContainer);
                            
                            // 淡出 desk 视频和文字
                            deskVideo.style.opacity = '0';
                            deskVideo.style.transition = 'opacity 2s ease';
                            const textContainer = document.querySelector('.video-text-container');
                            if (textContainer) {
                                textContainer.style.opacity = '0';
                                textContainer.style.transition = 'opacity 2s ease';
                            }
                            
                            // 隐藏返回按钮
                            const backButton = document.querySelector('.prev-page');
                            if (backButton) {
                                backButton.style.display = 'none';
                            }
                            
                            // 添加 light 视频
                            videoPage.appendChild(lightVideo);
                            
                            // 播放 light 视频
                            lightVideo.play();
                            
                            // 淡入 light 视频
                            setTimeout(() => {
                                lightVideo.style.opacity = '1';
                            }, 100);
                            
                            // 监听视频结束事件
                            lightVideo.addEventListener('ended', function() {
                                lightVideo.pause();
                                lightVideo.currentTime = lightVideo.duration;
                                // 显示文字
                                lightTextContainer.classList.remove('hidden');
                                document.getElementById('light-text-1').classList.remove('hidden');
                                // 8秒后文字和页面消失，应用结束
                                setTimeout(() => {
                                    // 文字淡出
                                    lightTextContainer.style.transition = 'opacity 1s ease-out';
                                    lightTextContainer.style.opacity = '0';
                                    
                                    // 页面淡出
                                    videoPage.style.transition = 'opacity 1s ease-out';
                                    videoPage.style.opacity = '0';
                                    
                                    setTimeout(() => {
                                        videoPage.style.display = 'none';
                                        
                                        // 关闭摄像头框
                                        const cameraContainer = document.getElementById('cameraContainer');
                                        const gestureHintBox = document.getElementById('gestureHintBox');
                                        if (cameraContainer) {
                                            cameraContainer.style.display = 'none';
                                        }
                                        if (gestureHintBox) {
                                            gestureHintBox.style.display = 'none';
                                        }
                                        
                                        // 停止摄像头流
                                        const cameraVideo = document.getElementById('cameraVideo');
                                        if (cameraVideo && cameraVideo.srcObject) {
                                            const tracks = cameraVideo.srcObject.getTracks();
                                            tracks.forEach(track => track.stop());
                                            cameraVideo.srcObject = null;
                                        }
                                        
                                        // 停止glass音频
                                        if (glassAudio) {
                                            glassAudio.pause();
                                            glassAudio.currentTime = 0;
                                        }
                                    }, 1000);
                                }, 8000);
                            });
                        }, 800); // 增加停顿时间
                    }, 1000); // 等待图片消失动画完成
                }
            }
        });
         }
});

// 恢复 backToHealing 函数
function backToHealing() {
    document.getElementById('videoPage').style.display = 'none';
    document.getElementById('healingPage').style.display = 'flex';
    const video = document.getElementById('deskVideo');
    video.pause();
    video.currentTime = 0;
    video.style.opacity = '1'; // 恢复视频透明度
    
    // 重置文字动画和箭头
    document.querySelectorAll('.video-text-column').forEach(column => {
        column.classList.remove('active');
    });
    const grabHint = document.querySelector('.grab-hint');
    if (grabHint) {
        grabHint.classList.add('hidden');
    }
    
    // 移除图片容器
    const imageContainer = document.querySelector('.plant-image-container');
    if (imageContainer) {
        imageContainer.remove();
    }
}

// 植物型人格测试相关代码
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

const personalityTypes = {
    'ISTJ': { plant: '雪松', description: '你像雪松一样坚韧、可靠，注重规则和秩序。你的思维严谨，做事有条理，是团队中的"稳定器"。但有时过于坚持原则，可能显得固执，容易忽视情感需求。' },
    'ISFJ': { plant: '木绣球', description: '你如木绣球般温柔包容，默默守护他人。你细心体贴，但可能过度付出，导致能量耗尽。习惯回避冲突，容易积累委屈。' },
    'INFJ': { plant: '菩提树', description: '你像菩提树，充满智慧与灵性，渴望深度联结。你容易共情他人，但也可能因理想主义而疲惫，或因现实落差感到孤独。' },
    'INTJ': { plant: '红杉', description: '你是红杉般的战略家，理性、独立，追求高效。但过度依赖逻辑可能压抑情感，显得疏离。完美主义会让你对他人（和自己）过于苛刻。' },
    'ISTP': { plant: '白桦', description: '你如白桦般自由洒脱，擅长动手解决问题。讨厌束缚，但可能逃避长期承诺。习惯用"冷漠"掩饰敏感，容易感到孤独。' },
    'ISFP': { plant: '蓝花楹', description: '你是蓝花楹般的浪漫主义者，审美敏锐，追求独特。但敏感易受伤，常因批评自我怀疑。习惯用"逃避"应对压力。' },
    'INFP': { plant: '樱花', description: '你如樱花般纯粹，相信每个灵魂都值得温柔以待。极致绽放的勇气背后，是对生命短暂的深刻觉知。常常在治愈他人时，自己的花瓣却悄悄飘落。' },
    'INTP': { plant: '银杏', description: '你是银杏般的思考者，用二分脉络解析世界。热爱知识迷宫，却可能困在自己编织的思维网络中。雌雄异株的特性暗示着你时而渴望交流，时而享受独处。' },
    'ESTP': { plant: '凤凰木', description: '你如凤凰木般热烈张扬，根系能突破混凝土的束缚。享受即兴发挥的快感，但冲动可能带来不必要的风险。讨厌例行公事，渴望持续的新鲜刺激。' },
    'ESFP': { plant: '牡丹', description: '你是牡丹般的魅力中心，雍容华贵，天生擅长点燃气氛。但过度依赖外界反馈，独处时容易陷入存在性焦虑。讨厌被忽视，需要持续的关注滋养。' },
    'ENFP': { plant: '蒲公英', description: '你像蒲公英般自由不羁，种子能随风探索新大陆。思维跳跃充满创意，但难以持续专注。常常同时开启多个项目，却很少坚持到收获季节。' },
    'ENTP': { plant: '猴面包树', description: '你是猴面包树般的创新者，能在荒漠中创造生存奇迹。热爱智力游戏和头脑风暴，但可能为了辩论而辩论。夜间开花的特性暗示你常在他人休息时灵感迸发。' },
    'ESTJ': { plant: '橡树', description: '你如橡树般威严可靠，年轮记载着丰富的经验法则。善于建立高效系统，但可能过度强调"应该"而缺乏变通。像橡果滋养森林一样，你通过指导他人获得满足。' },
    'ESFJ': { plant: '向日葵', description: '你是向日葵般的温暖存在，天生懂得调节角度照耀每个角落。花盘由无数小花组成的特性，显示你擅长整合各方需求。但可能因过度照顾他人而忽略自己。' },
    'ENFJ': { plant: '榕树', description: '你如榕树般包容智慧，气根落地即成新干。天生具备导师气质，能看到他人潜力。但可能过度介入他人成长，或为学生的停滞而焦虑。' },
    'ENTJ': { plant: '竹子', description: '你是竹子般的战略大师，地下茎数年蛰伏只为爆发式成长。目标导向且执行力强，但可能因追求效率而忽视过程之美。像竹节划分阶段一样，你的人生充满清晰里程碑。' }
};

let currentQuestionIndex = 0;
let selectedAnswers = [];

function renderQuestion() {
    const questionContainer = document.getElementById('questionContainer');
    const question = questions[currentQuestionIndex];
    
    questionContainer.innerHTML = `
        <div class="question active">
            <h3>${question.question}</h3>
            <div class="options">
                ${question.options.map((option, index) => `
                    <div class="option" data-index="${index + 1}" onclick="selectOption(${currentQuestionIndex}, ${index})">
                        ${option.text}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // 播放page音效
    pageAudio.currentTime = 0;
    pageAudio.play();
}

function selectOption(questionIndex, optionIndex) {
    const selectedOption = questions[questionIndex].options[optionIndex];
    selectedAnswers[questionIndex] = selectedOption;
    
    // 高亮选中的选项
    const options = document.querySelectorAll('.option');
    options.forEach(option => option.classList.remove('selected'));
    options[optionIndex].classList.add('selected');
    
    // 延迟后进入下一题
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            renderQuestion();
        } else {
            showResult();
        }
    }, 500);
}

// 计算性格类型
function calculatePersonalityType() {
    const scores = {
        E: 0, I: 0,
        S: 0, N: 0,
        T: 0, F: 0,
        J: 0, P: 0
    };

    selectedAnswers.forEach(answer => {
        if (answer && answer.dimensions) {
            for (const [dimension, value] of Object.entries(answer.dimensions)) {
                scores[dimension] += value;
            }
        }
    });

    const type = [
        scores.E > scores.I ? 'E' : 'I',
        scores.S > scores.N ? 'S' : 'N',
        scores.T > scores.F ? 'T' : 'F',
        scores.J > scores.P ? 'J' : 'P'
    ].join('');

    return type;
}

function showResult() {
    const result = calculatePersonalityType();
    const personalityType = personalityTypes[result];
    
    const resultTitle = document.getElementById('personality-type');
    const resultText = document.getElementById('personality-description');
    
    resultTitle.textContent = `你的专属植物是${personalityType.plant}`;
    
    // 根据植物类型显示对应的带双引号的话
    let quote = '';
    switch(personalityType.plant) {
        case '雪松': quote = '"风雪中的秩序守护者，根系编织大地之网"'; break;
        case '木绣球': quote = '"温柔不是脆弱，是容纳万千生命的宇宙"'; break;
        case '菩提树': quote = '"向下扎根与向上开悟的永恒平衡"'; break;
        case '红杉': quote = '"向云端生长的野心，深埋地下的谦卑"'; break;
        case '白桦': quote = '"剥离所有冗余，在寒风中书写银白色的诗"'; break;
        case '蓝花楹': quote = '"用整个冬季的沉默，兑换一场春天的视觉革命"'; break;
        case '樱花': quote = '"极致绽放与坦然凋零的勇气同样珍贵"'; break;
        case '银杏': quote = '"活化石的古老智慧与分形几何的现代性共舞"'; break;
        case '凤凰木': quote = '"在高温中淬炼，把荒芜变成火红的庆典"'; break;
        case '牡丹': quote = '"拒绝含蓄的美学，要开就开成传奇"'; break;
        case '蒲公英': quote = '"不被定义的灵魂，把远方变成新的故乡"'; break;
        case '猴面包树': quote = '"在不可能之处，建立属于自己的诺亚方舟"'; break;
        case '橡树': quote = '"真正的强大，是让整个生态系统因你繁荣"'; break;
        case '向日葵': quote = '"永远面朝太阳，把温暖折射给每个角落"'; break;
        case '榕树': quote = '"让每个依附者最终都成为支撑你的力量"'; break;
        case '竹子': quote = '"沉默期的深度，决定破土时的高度"'; break;
    }
    resultText.textContent = quote;
    
    const testContainer = document.getElementById('testContainer');
    const resultContainer = document.getElementById('resultContainer');
    
    // 添加平滑过渡效果
    testContainer.style.transition = 'opacity 0.5s ease-out';
    testContainer.style.opacity = '0';
    
    setTimeout(() => {
    testContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');
        resultContainer.style.opacity = '0';
        resultContainer.style.transition = 'opacity 0.5s ease-in';
        
        setTimeout(() => {
            resultContainer.style.opacity = '1';
        }, 50);
    }, 500);
}

function goToPaper() {
    const paperPage = document.getElementById('paperPage');
    const resultContainer = document.getElementById('resultContainer');
    const analysisTitle = document.getElementById('analysis-title');
    const analysisContent = document.getElementById('analysis-content');
    
    const result = calculatePersonalityType();
    const personalityType = personalityTypes[result];
    
    analysisTitle.textContent = `${personalityType.plant}的性格分析`;
    analysisContent.textContent = personalityType.description;
    
    // 添加平滑过渡效果
    resultContainer.style.transition = 'opacity 0.5s ease-out';
    resultContainer.style.opacity = '0';
    
    setTimeout(() => {
    resultContainer.classList.add('hidden');
    paperPage.classList.remove('hidden');
        paperPage.style.opacity = '0';
        paperPage.style.transition = 'opacity 0.5s ease-in';
        
        setTimeout(() => {
            paperPage.style.opacity = '1';
        }, 50);
    }, 500);
}

function backToResult() {
    const paperPage = document.getElementById('paperPage');
    const resultContainer = document.getElementById('resultContainer');
    
    // 添加平滑过渡效果
    paperPage.style.transition = 'opacity 0.5s ease-out';
    paperPage.style.opacity = '0';
    
    setTimeout(() => {
        paperPage.classList.add('hidden');
        resultContainer.classList.remove('hidden');
        resultContainer.style.opacity = '0';
        resultContainer.style.transition = 'opacity 0.5s ease-in';
        
        setTimeout(() => {
            resultContainer.style.opacity = '1';
        }, 50);
    }, 500);
}

function backToAnalysis() {
    const healingPage = document.getElementById('healingPage');
    const paperPage = document.getElementById('paperPage');
    
    // 添加平滑过渡效果
    healingPage.style.transition = 'opacity 0.5s ease-out';
    healingPage.style.opacity = '0';
    
    setTimeout(() => {
        healingPage.classList.add('hidden');
        paperPage.classList.remove('hidden');
        paperPage.style.opacity = '0';
        paperPage.style.transition = 'opacity 0.5s ease-in';
        
        setTimeout(() => {
            paperPage.style.opacity = '1';
        }, 50);
    }, 500);
}

function goToHealing() {
    const healingPage = document.getElementById('healingPage');
    const paperPage = document.getElementById('paperPage');
    
    const result = calculatePersonalityType();
    const personalityType = personalityTypes[result];
    
    const healingTitle = document.getElementById('healing-title');
    const healingContent = document.getElementById('healing-content');
    
    healingTitle.textContent = `${personalityType.plant}的疗愈方案`;
    
    // 根据植物类型显示对应的疗愈方案
    let healingPlan = '';
    switch(personalityType.plant) {
        case '雪松':
            healingPlan = '每周留出半天时间，不带计划地闲逛公园或超市\n和家人朋友聊天时，试着分享一件最近让你开心的小事';
            break;
        case '木绣球':
            healingPlan = '每天睡前对自己说三遍"今天我已经做得很好了"\n遇到不想做的事，练习说"让我考虑一下"而不是直接答应';
            break;
        case '菩提树':
            healingPlan = '周末关掉手机，在家泡杯茶看本轻松的书\n把大目标写成便利贴，完成一个就撕掉一张';
            break;
        case '红杉':
            healingPlan = '尝试一次说走就走的短途旅行，不做详细攻略\n看一部感人的电影，允许自己哭出来';
            break;
        case '白桦':
            healingPlan = '约好朋友一起吃火锅，聊聊彼此的近况\n生气时先深呼吸三次，再写下"我生气是因为..."';
            break;
        case '蓝花楹':
            healingPlan = '买本涂色书，心烦时就涂几页\n每天照镜子时夸自己一个优点，比如"今天的发型不错"';
            break;
        case '樱花':
            healingPlan = '每月选一天做"自我关爱日"，只做让自己开心的事\n收集好看的落叶或花瓣，做成简易书签';
            break;
        case '银杏':
            healingPlan = '种一盆容易养活的绿植，记录它的生长\n摸不同材质的物品，感受布料、木头、金属的触感';
            break;
        case '凤凰木':
            healingPlan = '做决定前先睡一觉，第二天再行动\n每天早晨喝杯温水，静坐五分钟再开始一天';
            break;
        case '牡丹':
            healingPlan = '准备一个"优点罐"，每天往里面放一张写有自己内在优点的小纸条（比如"今天耐心听同事倾诉"）\n整理衣柜时，留下那些穿着舒服而不是只为好看的衣服';
            break;
        case '蒲公英':
            healingPlan = '坚持三周每天写一句话日记\n把突发奇想记下来，周末选一个最可行的试试';
            break;
        case '猴面包树':
            healingPlan = '跟人争论时，先说出一个对方的优点\n把好点子写成小故事或画成漫画';
            break;
        case '橡树':
            healingPlan = '团建时让大家自由发挥，不设评分标准\n跟年轻人学用一个新APP，比如学拍短视频';
            break;
        case '向日葵':
            healingPlan = '每天晚饭后留半小时完全属于自己的时间\n帮助别人前先问"需要我怎么做"';
            break;
        case '榕树':
            healingPlan = '观察阳台植物的生长，不过度浇水施肥\n把操心的事写在纸上，折成飞机扔出去';
            break;
        case '竹子':
            healingPlan = '用手机记录每天的小进步，比如"今天准时下班"\n组织一次没有主题的聚餐，纯聊天不谈工作';
            break;
    }
    
    healingContent.textContent = healingPlan;
    
    // 添加平滑过渡效果
    paperPage.style.transition = 'opacity 0.5s ease-out';
    paperPage.style.opacity = '0';
    
    setTimeout(() => {
    paperPage.classList.add('hidden');
    healingPage.classList.remove('hidden');
        healingPage.style.opacity = '0';
        healingPage.style.transition = 'opacity 0.5s ease-in';
        
        setTimeout(() => {
            healingPage.style.opacity = '1';
        }, 50);
    }, 500);
}

function claimPlant() {
    document.getElementById('healingPage').style.display = 'none';
    document.getElementById('videoPage').style.display = 'flex';
    const video = document.getElementById('deskVideo');
    
    if (video.readyState >= 2) {
        playVideo();
    } else {
        video.addEventListener('loadeddata', playVideo);
    }

    function playVideo() {
        video.currentTime = 0;
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log("视频开始播放");
                const textColumns = document.querySelectorAll('.video-text-column');
                textColumns.forEach((column, index) => {
                    setTimeout(() => {
                        column.classList.add('active');
                        if (index === 1) {
                            setTimeout(() => {
                                const grabHint = document.querySelector('.grab-hint');
                                grabHint.classList.remove('hidden');
                                console.log("显示箭头和提示文字");
                            }, 1500);
                        }
                    }, index * 1500);
                });
            }).catch(error => {
                console.log("视频播放失败:", error);
            });
        }
        
        video.loop = false;
        video.addEventListener('ended', function() {
            video.pause();
            video.currentTime = video.duration;
        });
    }
}

// 初始化测试相关功能
document.addEventListener('DOMContentLoaded', function() {
    const startCraftButton = document.querySelector('.start-craft-button');
    if (startCraftButton) {
        startCraftButton.addEventListener('click', function() {
            const paperContainer = document.getElementById('paperContainer');
            paperContainer.classList.add('hidden');
            document.getElementById('testContainer').classList.remove('hidden');
            renderQuestion();
        });
    }
}); 