// script.js
window.requestAnimationFrame =
    window.__requestAnimationFrame ||
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    (function () {
        return function (callback, element) {
            var lastTime = element.__lastTime;
            if (lastTime === undefined) {
                lastTime = 0;
            }
            var currTime = Date.now();
            var timeToCall = Math.max(1, 33 - (currTime - lastTime));
            window.setTimeout(callback, timeToCall);
            element.__lastTime = currTime + timeToCall;
        };
    })();

window.isDevice = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(((navigator.userAgent || navigator.vendor || window.opera)).toLowerCase()));

var loaded = false;
var init = function () {
    if (loaded) return;
    loaded = true;
    var mobile = window.isDevice;
    var koef = mobile ? 0.5 : 1;
    var canvas = document.getElementById('heart');
    var ctx = canvas.getContext('2d');
    var width = canvas.width = koef * innerWidth;
    var height = canvas.height = koef * innerHeight;
    var rand = Math.random;
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, width, height);

    // Добавляем отслеживание позиции мыши и волны
    var mouseX = width / 2;
    var mouseY = height / 2;
    var mouseRadius = 150;
    var waves = [];
    var lastMouseX = mouseX;
    var lastMouseY = mouseY;

    canvas.addEventListener('mousemove', function(e) {
        var dx = e.clientX - lastMouseX;
        var dy = e.clientY - lastMouseY;
        var speed = Math.sqrt(dx * dx + dy * dy);
        
        if (speed > 5) {
            waves.push({
                x: e.clientX,
                y: e.clientY,
                radius: 1,
                maxRadius: mouseRadius * 2,
                speed: 5,
                life: 1,
                color: `hsla(${Math.random() * 360}, 100%, 50%, 0.3)`
            });
        }
        
        lastMouseX = mouseX = e.clientX;
        lastMouseY = mouseY = e.clientY;
    });

    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        var touch = e.touches[0];
        var dx = touch.clientX - lastMouseX;
        var dy = touch.clientY - lastMouseY;
        var speed = Math.sqrt(dx * dx + dy * dy);
        
        if (speed > 5) {
            waves.push({
                x: touch.clientX,
                y: touch.clientY,
                radius: 1,
                maxRadius: mouseRadius * 2,
                speed: 5,
                life: 1,
                color: `hsla(${Math.random() * 360}, 100%, 50%, 0.3)`
            });
        }
        
        lastMouseX = mouseX = touch.clientX;
        lastMouseY = mouseY = touch.clientY;
    });

    // Добавляем текст "RGB yuliitezary" через JavaScript
    var title = document.createElement('div');
    title.innerHTML = "RGB yuliitezary";
    title.style.position = 'absolute';
    title.style.top = '20px';
    title.style.width = '100%';
    title.style.textAlign = 'center';
    title.style.fontSize = '32px';
    title.style.fontFamily = 'Arial, sans-serif';
    title.style.zIndex = '10';
    title.style.textShadow = '0 0 10px rgba(255,255,255,0.5)';
    title.style.transition = 'all 0.3s ease';
    document.body.appendChild(title);

    // Улучшенная функция для создания анимации переливающегося цвета
    function animateRGBText() {
        const time = Date.now() / 1000;
        const r = Math.floor(128 + 128 * Math.sin(time));
        const g = Math.floor(128 + 128 * Math.sin(time + 2));
        const b = Math.floor(128 + 128 * Math.sin(time + 4));
        
        title.style.color = `rgb(${r},${g},${b})`;
        title.style.transform = `scale(${1 + 0.1 * Math.sin(time)})`;
        
        requestAnimationFrame(animateRGBText);
    }

    // Запуск анимации цвета текста
    animateRGBText();

    var heartPosition = function (rad) {
        return [Math.pow(Math.sin(rad), 3), -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))];
    };

    var scaleAndTranslate = function (pos, sx, sy, dx, dy) {
        return [dx + pos[0] * sx, dy + pos[1] * sy];
    };

    window.addEventListener('resize', function () {
        width = canvas.width = koef * innerWidth;
        height = canvas.height = koef * innerHeight;
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(0, 0, width, height);
    });

    var traceCount = mobile ? 20 : 50;
    var pointsOrigin = [];
    var i;
    var dr = mobile ? 0.3 : 0.1;
    for (i = 0; i < Math.PI * 2; i += dr) pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210, 13, 0, 0));
    for (i = 0; i < Math.PI * 2; i += dr) pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150, 9, 0, 0));
    for (i = 0; i < Math.PI * 2; i += dr) pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90, 5, 0, 0));
    var heartPointsCount = pointsOrigin.length;

    var targetPoints = [];
    var pulse = function (kx, ky) {
        for (i = 0; i < pointsOrigin.length; i++) {
            targetPoints[i] = [];
            targetPoints[i][0] = kx * pointsOrigin[i][0] + width / 2;
            targetPoints[i][1] = ky * pointsOrigin[i][1] + height / 2;
        }
    };

    var e = [];
    for (i = 0; i < heartPointsCount; i++) {
        var x = rand() * width;
        var y = rand() * height;
        e[i] = {
            vx: 0,
            vy: 0,
            R: 2,
            speed: rand() + 5,
            q: ~~(rand() * heartPointsCount),
            D: 2 * (i % 2) - 1,
            force: 0.2 * rand() + 0.7,
            f: `hsla(${Math.random() * 360}, 100%, 50%, 0.8)`,
            trace: []
        };
        for (var k = 0; k < traceCount; k++) e[i].trace[k] = {x: x, y: y};
    }

    var config = {
        traceK: 0.4,
        timeDelta: 0.01
    };

    var time = 0;
    var loop = function () {
        var n = -Math.cos(time);
        
        // Добавляем реакцию на мышь
        var dx = mouseX - width / 2;
        var dy = mouseY - height / 2;
        var distance = Math.sqrt(dx * dx + dy * dy);
        var mouseInfluence = Math.max(0, 1 - distance / mouseRadius);
        
        // Изменяем пульсацию в зависимости от позиции мыши
        var mouseScale = 1 + mouseInfluence * 0.3;
        pulse((1 + n) * .5 * mouseScale, (1 + n) * .5 * mouseScale);
        
        time += ((Math.sin(time)) < 0 ? 9 : (n > 0.8) ? .2 : 1) * config.timeDelta;
        ctx.fillStyle = "rgba(0,0,0,.1)";
        ctx.fillRect(0, 0, width, height);
        
        // Обновляем и рисуем волны
        for (var i = waves.length - 1; i >= 0; i--) {
            var wave = waves[i];
            wave.radius += wave.speed;
            wave.life -= 0.01;
            
            if (wave.life <= 0 || wave.radius > wave.maxRadius) {
                waves.splice(i, 1);
                continue;
            }
            
            ctx.beginPath();
            ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
            ctx.strokeStyle = wave.color.replace('0.3', wave.life.toFixed(2));
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
        }
        
        // Добавляем свечение вокруг курсора
        var gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, mouseRadius);
        gradient.addColorStop(0, 'rgba(255,255,255,0.2)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.1)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        for (i = e.length; i--;) {
            var u = e[i];
            var q = targetPoints[u.q];
            var dx = u.trace[0].x - q[0];
            var dy = u.trace[0].y - q[1];
            var length = Math.sqrt(dx * dx + dy * dy);
            
            // Улучшенное отталкивание от курсора с учетом волн
            var mouseDx = u.trace[0].x - mouseX;
            var mouseDy = u.trace[0].y - mouseY;
            var mouseDist = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
            
            // Влияние волн на частицы
            waves.forEach(function(wave) {
                var waveDx = u.trace[0].x - wave.x;
                var waveDy = u.trace[0].y - wave.y;
                var waveDist = Math.sqrt(waveDx * waveDx + waveDy * waveDy);
                
                if (Math.abs(waveDist - wave.radius) < 20) {
                    var waveForce = (1 - Math.abs(waveDist - wave.radius) / 20) * wave.life;
                    u.vx += (waveDx / waveDist) * waveForce * u.speed * 0.2;
                    u.vy += (waveDy / waveDist) * waveForce * u.speed * 0.2;
                }
            });
            
            if (mouseDist < mouseRadius) {
                var force = (1 - mouseDist / mouseRadius) * 2;
                u.vx += (mouseDx / mouseDist) * force * u.speed;
                u.vy += (mouseDy / mouseDist) * force * u.speed;
            }
            
            if (10 > length) {
                if (0.95 < rand()) {
                    u.q = ~~(rand() * heartPointsCount);
                } else {
                    if (0.99 < rand()) {
                        u.D *= -1;
                    }
                    u.q += u.D;
                    u.q %= heartPointsCount;
                    if (0 > u.q) {
                        u.q += heartPointsCount;
                    }
                }
            }
            u.vx += -dx / length * u.speed;
            u.vy += -dy / length * u.speed;
            u.trace[0].x += u.vx;
            u.trace[0].y += u.vy;
            u.vx *= u.force;
            u.vy *= u.force;
            for (k = 0; k < u.trace.length - 1;) {
                var T = u.trace[k];
                var N = u.trace[++k];
                N.x -= config.traceK * (N.x - T.x);
                N.y -= config.traceK * (N.y - T.y);
            }
            ctx.fillStyle = u.f;
            for (k = 0; k < u.trace.length; k++) {
                ctx.fillRect(u.trace[k].x, u.trace[k].y, 1, 1);
            }
        }
        window.requestAnimationFrame(loop, canvas);
    };
    loop();
};

var s = document.readyState;
if (s === 'complete' || s === 'loaded' || s === 'interactive') init();
else document.addEventListener('DOMContentLoaded', init, false);
