/**
 * 蟹源 - 交互功能脚本
 * 包含购物车、生长展示、标签切换等功能
 */

// ========================================
// 购物车功能
// ========================================
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.updateCartUI();
        this.bindEvents();
    }

    bindEvents() {
        // 购物车按钮
        document.getElementById('cartBtn')?.addEventListener('click', () => this.openCart());
        document.getElementById('closeCart')?.addEventListener('click', () => this.closeCart());
        document.getElementById('cartOverlay')?.addEventListener('click', () => this.closeCart());
        
        // 结算按钮
        document.getElementById('checkoutBtn')?.addEventListener('click', () => this.checkout());
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
        } else {
            this.items.push({
                ...product,
                quantity: product.quantity || 1
            });
        }
        
        this.saveCart();
        this.updateCartUI();
        this.showNotification('商品已添加到购物车');
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartUI();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartUI();
            }
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    getTotal() {
        return this.items.reduce((total, item) => {
            const price = parseFloat(item.price);
            return total + (price * item.quantity);
        }, 0);
    }

    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    updateCartUI() {
        // 更新购物车数量
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = this.getItemCount();
        }

        // 更新购物车列表
        const cartItems = document.getElementById('cartItems');
        if (cartItems) {
            if (this.items.length === 0) {
                cartItems.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-basket"></i>
                        <p>购物车是空的</p>
                    </div>
                `;
            } else {
                cartItems.innerHTML = this.items.map(item => `
                    <div class="cart-item" data-id="${item.id}">
                        <div class="cart-item-image">
                            <img src="${item.image}" alt="${item.name}" onerror="this.src=''">
                        </div>
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">¥${item.price}</div>
                            <div class="cart-item-actions">
                                <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                                <span class="cart-item-quantity">${item.quantity}</span>
                                <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                                <button class="remove-item" onclick="cart.removeItem(${item.id})">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }

        // 更新总价
        const totalPrice = document.getElementById('totalPrice');
        if (totalPrice) {
            totalPrice.textContent = `¥${this.getTotal().toFixed(2)}`;
        }
    }

    openCart() {
        document.getElementById('cartSidebar')?.classList.add('open');
        document.getElementById('cartOverlay')?.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        document.getElementById('cartSidebar')?.classList.remove('open');
        document.getElementById('cartOverlay')?.classList.remove('open');
        document.body.style.overflow = '';
    }

    checkout() {
        if (this.items.length === 0) {
            this.showNotification('购物车是空的', 'warning');
            return;
        }
        
        // 模拟结算
        this.showNotification('正在跳转到支付页面...', 'success');
        
        // 实际项目中这里应该跳转到支付页面
        setTimeout(() => {
            alert(`订单总额：¥${this.getTotal().toFixed(2)}\n感谢您的购买！`);
            this.items = [];
            this.saveCart();
            this.updateCartUI();
            this.closeCart();
        }, 1500);
    }

    showNotification(message, type = 'success') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background: ${type === 'success' ? '#38a169' : '#d69e2e'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // 3秒后移除
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// 初始化购物车
const cart = new ShoppingCart();

// 添加到购物车函数
function addToCart(productId) {
    const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (!productCard) return;

    const name = productCard.dataset.name;
    const price = productCard.dataset.price;
    const image = productCard.dataset.image;
    const unit = productCard.dataset.unit || '件';

    // 检查是否有礼盒加购
    const giftCheckbox = productCard.querySelector('.gift-checkbox');
    let finalPrice = parseFloat(price);
    let finalName = name;

    if (giftCheckbox && giftCheckbox.checked) {
        finalPrice += 58.8;
        finalName += '（含礼盒）';
    }

    cart.addItem({
        id: productId,
        name: finalName,
        price: finalPrice.toFixed(2),
        image: image,
        quantity: 1
    });
}

// ========================================
// 导航栏功能
// ========================================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');

    // 滚动效果
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
    });

    // 移动端菜单切换
    mobileToggle?.addEventListener('click', () => {
        navMenu?.classList.toggle('open');
        mobileToggle.classList.toggle('active');
    });

    // 点击导航链接关闭菜单
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu?.classList.remove('open');
            mobileToggle?.classList.remove('active');
        });
    });
}

// ========================================
// 数字计数动画
// ========================================
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.count);
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;

                const updateCounter = () => {
                    current += step;
                    if (current < target) {
                        counter.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };

                updateCounter();
                observer.unobserve(counter);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

// ========================================
// 螃蟹生长展示功能
// ========================================
function initGrowthShowcase() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const crabStages = document.querySelectorAll('.crab-stage');
    const progressBar = document.getElementById('progressBar');
    let currentStage = 1;
    let autoPlayInterval;

    function showStage(stageNum) {
        // 更新时间轴
        timelineItems.forEach((item, index) => {
            if (index + 1 === stageNum) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // 更新展示图
        crabStages.forEach((stage, index) => {
            if (index + 1 === stageNum) {
                stage.classList.add('active');
            } else {
                stage.classList.remove('active');
            }
        });

        // 更新进度条
        if (progressBar) {
            const progress = (stageNum / 6) * 100;
            progressBar.style.width = `${progress}%`;
        }

        currentStage = stageNum;
    }

    // 点击时间轴切换
    timelineItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            showStage(index + 1);
            resetAutoPlay();
        });
    });

    // 自动播放
    function autoPlay() {
        autoPlayInterval = setInterval(() => {
            const nextStage = currentStage >= 6 ? 1 : currentStage + 1;
            showStage(nextStage);
        }, 4000);
    }

    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        autoPlay();
    }

    // 开始自动播放
    autoPlay();

    // 鼠标悬停时暂停
    const growthShowcase = document.querySelector('.growth-showcase');
    growthShowcase?.addEventListener('mouseenter', () => {
        clearInterval(autoPlayInterval);
    });

    growthShowcase?.addEventListener('mouseleave', () => {
        autoPlay();
    });
}

// ========================================
// 食用指南标签切换
// ========================================
function initGuideTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;

            // 更新按钮状态
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 更新内容显示
            tabContents.forEach(content => {
                if (content.id === tabId) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
}

// ========================================
// 滚动显示动画
// ========================================
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.story-block, .value-item, .product-card, .nutrition-item, .recipe-card, .storage-card, .feature-card'
    );

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('reveal');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ========================================
// 平滑滚动
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========================================
// 添加CSS动画样式
// ========================================
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .mobile-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .mobile-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(5px, -5px);
        }
    `;
    document.head.appendChild(style);
}

// ========================================
// 页面加载完成后初始化
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initCounters();
    initGrowthShowcase();
    initGuideTabs();
    initScrollReveal();
    initSmoothScroll();
    addAnimationStyles();
});

// ========================================
// 页面可见性变化处理
// ========================================
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面不可见时暂停动画
        document.body.classList.add('paused');
    } else {
        document.body.classList.remove('paused');
    }
});

// ========================================
// 性能优化：图片懒加载
// ========================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}
