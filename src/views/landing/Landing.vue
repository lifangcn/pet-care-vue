<template>
  <div class="landing-page">
    <!-- 顶部导航 -->
    <header class="landing-header">
      <div class="header-inner">
        <span class="brand">PetCare</span>
        <router-link to="/login" class="btn-login">登录</router-link>
      </div>
    </header>

    <!-- 主视觉区：价值主张 -->
    <section class="hero-section">
      <div class="hero-noise"></div>
      <div class="hero-content">
        <h1 class="hero-title">
          宠物关怀助手
        </h1>
        <p class="hero-tagline">
          发现更合适的，从真实分享开始
        </p>
        <p class="hero-desc">
          用你的真实体验，帮更多人找到适合毛孩子的食品、用品和好去处。真实养宠人的分享社区，少踩坑，多发现。
        </p>
        <router-link to="/login" class="btn-primary">开始使用</router-link>
      </div>
      <div class="hero-visual">
        <div class="paw-blob"></div>
        <img
          src="/images/feature-share.png"
          alt="人宠开心互动 - 人与宠物在户外玩耍"
          class="hero-image"
        />
      </div>
    </section>

    <!-- 功能介绍：交错布局，非三卡片 -->
    <section class="features-section">
      <h2 class="section-title">你的分享，是别人的指路牌</h2>

      <article class="feature-block feature-left">
        <div class="feature-content">
          <h3>真实分享</h3>
          <p>
            分享你用过的好粮、好用品、好场地。找不到适合宠物的食品和用品？来这里看看真实养宠人的测评与推荐，少踩坑，多发现。
          </p>
        </div>
        <div class="feature-visual">
          <img src="/images/hero-human-pet.png" alt="人宠开心玩耍 - 真实分享养宠体验" />
        </div>
      </article>

      <article class="feature-block feature-right">
        <div class="feature-content">
          <h3>宠物友好场地</h3>
          <p>
            发现遛狗好去处、户外娱乐场地、宠物友好公园。同城宠友的真实分享，帮你找到适合毛孩子撒欢的地方。
          </p>
        </div>
        <div class="feature-visual">
          <img src="/images/feature-park.png" alt="宠物友好场地 - 户外遛狗好去处" />
        </div>
      </article>

      <article class="feature-block feature-left">
        <div class="feature-content">
          <h3>内容广场</h3>
          <p>
            发布养宠动态，与宠物社区同好交流。种草、避坑、发现适合的粮和用品，让每个人的真实体验都能帮助到他人。
          </p>
        </div>
        <div class="feature-visual">
          <img src="/images/feature-community.jpg" alt="人宠社区 - 养宠同好交流分享" />
        </div>
      </article>

      <article class="feature-block feature-right">
        <div class="feature-content">
          <h3>活动与提醒</h3>
          <p>
            参与线下活动、线上打卡，结识同城宠友。遛狗、喂食等日常提醒，让养宠生活更从容。
          </p>
        </div>
        <div class="feature-visual">
          <img src="/images/feature-activity.png" alt="人宠活动 - 遛狗散步结识宠友" />
        </div>
      </article>
    </section>

    <!-- CTA 区 -->
    <section class="cta-section">
      <div class="cta-noise"></div>
      <h2 class="cta-title">发现更合适的，从真实分享开始</h2>
      <p class="cta-desc">用你的真实体验，帮更多人找到适合毛孩子的食品、用品和好去处</p>
      <router-link to="/login" class="btn-primary btn-large">立即登录</router-link>
    </section>

    <footer class="landing-footer">
      <p>PetCare 宠物关怀助手 · 发现更合适的，从真实分享开始</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// 落地页 - SEO 优化：H1/H2/H3 语义化、关键词自然融入
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as vars;
@use '@/styles/pet-theme.scss' as pet;
@use '@/styles/animations.scss' as anim;

.landing-page {
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: pet.$pet-bg-paper;
}

// 顶部导航
.landing-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 16px 24px;
  background: rgba(253, 249, 243, 0.9);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(212, 163, 115, 0.15);
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  font-family: vars.$font-family-cute;
  font-size: 22px;
  font-weight: 700;
  color: pet.$pet-primary;
}

.btn-login {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  color: pet.$pet-primary;
  background: transparent;
  border: 2px solid rgba(224, 122, 95, 0.3);
  border-radius: pet.$pet-radius-md;
  text-decoration: none;
  transition: all 200ms ease-out;

  &:hover {
    background: rgba(224, 122, 95, 0.08);
    border-color: pet.$pet-primary;
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(224, 122, 95, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
}

// 主视觉区
.hero-section {
  position: relative;
  display: grid;
  // Hero 两列比例：右侧图片更有存在感（最小改动，不改 DOM）
  grid-template-columns: 1.05fr 0.95fr;
  gap: 48px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 120px 32px 80px;
  overflow: hidden;
}

.hero-noise {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.04;
  pointer-events: none;
  mix-blend-mode: overlay;
}

.hero-content {
  position: relative;
  z-index: 1;
  padding-top: 24px;
}

.hero-title {
  font-family: vars.$font-family-cute;
  font-size: clamp(32px, 5vw, 44px);
  font-weight: 700;
  color: vars.$pet-charcoal;
  margin: 0 0 16px;
  line-height: 1.2;
}

.hero-tagline {
  font-size: clamp(18px, 2.5vw, 22px);
  font-weight: 600;
  color: pet.$pet-primary;
  margin: 0 0 20px;
}

.hero-desc {
  font-size: 16px;
  line-height: 1.7;
  color: pet.$pet-warm-gray;
  margin: 0 0 32px;
  max-width: 420px;
}

.btn-primary {
  display: inline-block;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: pet.$pet-primary;
  border-radius: pet.$pet-radius-md;
  text-decoration: none;
  // Claymorphism 按钮
  border: 2px solid rgba(224, 122, 95, 0.3);
  box-shadow:
    inset -2px -2px 6px rgba(0, 0, 0, 0.1),
    inset 2px 2px 6px rgba(255, 255, 255, 0.25),
    4px 4px 12px rgba(224, 122, 95, 0.3);
  transition: all 200ms ease-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      inset -2px -2px 6px rgba(0, 0, 0, 0.1),
      inset 2px 2px 6px rgba(255, 255, 255, 0.25),
      6px 6px 16px rgba(224, 122, 95, 0.4);
  }

  &:active {
    transform: translateY(0) scale(0.98);
    box-shadow:
      inset 2px 2px 6px rgba(0, 0, 0, 0.15),
      inset -2px -2px 6px rgba(255, 255, 255, 0.1),
      2px 2px 6px rgba(224, 122, 95, 0.25);
  }
}

.hero-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  // 让图片略“出血”贴边，避免显得缩在容器里
  padding-right: 12px;
  margin-right: -14px;
}

.paw-blob {
  position: absolute;
  // 背后的暖色雾团：稍微变大并更靠右，配合图片出血
  width: 240px;
  height: 240px;
  right: 12%;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, rgba(224, 122, 95, 0.2) 0%, rgba(129, 178, 154, 0.15) 100%);
  border-radius: 50%;
  filter: blur(40px);
}

.hero-image {
  position: relative;
  z-index: 2;
  width: 100%;
  // 让主图更大，但用固定视觉比例避免”长图/扁图”导致布局松散
  max-width: 460px;
  aspect-ratio: 4 / 3;
  height: auto;
  border-radius: pet.$pet-radius-xl;
  // Claymorphism 图片效果
  border: 2px solid rgba(212, 163, 115, 0.2);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  object-fit: cover;
  object-position: center;
  // 轻微错位：减少”完美居中”的模板感
  transform: rotate(-0.4deg) translateY(6px);
  transition: all 250ms ease-out;

  &:hover {
    transform: rotate(-0.3deg) translateY(4px) scale(1.01);
    box-shadow:
      0 12px 32px rgba(224, 122, 95, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }
}

// 功能介绍
.features-section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 64px 32px;
}

.section-title {
  font-family: vars.$font-family-cute;
  font-size: clamp(24px, 4vw, 30px);
  font-weight: 700;
  color: vars.$pet-charcoal;
  text-align: center;
  margin: 0 0 56px;
}

.feature-block {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
  margin-bottom: 64px;

  &:last-child {
    margin-bottom: 0;
  }
}

.feature-right {
  .feature-content {
    order: 2;
  }
  .feature-visual {
    order: 1;
  }
}

.feature-content {
  h3 {
    font-family: vars.$font-family-cute;
    font-size: 22px;
    font-weight: 600;
    color: pet.$pet-primary;
    margin: 0 0 12px;
  }

  p {
    font-size: 15px;
    line-height: 1.75;
    color: pet.$pet-warm-gray;
    margin: 0;
  }
}

.feature-visual {
  // 功能区图片容器：避免图片被 max-width 限制后出现”奇怪留白”
  display: flex;
  justify-content: flex-end;
  align-items: center;

  img {
    width: 100%;
    // 稍微放大，配合贴边对齐减少空洞感
    max-width: 380px;
    height: auto;
    border-radius: pet.$pet-radius-lg;
    // Claymorphism 图片效果
    border: 2px solid rgba(212, 163, 115, 0.15);
    box-shadow:
      0 6px 20px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
    object-fit: cover;
    transition: all 250ms ease-out;

    &:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow:
        0 10px 28px rgba(224, 122, 95, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.6);
    }
  }
}

.feature-icon {
  width: 140px;
  height: 140px;
  border-radius: pet.$pet-radius-lg;
  background: linear-gradient(145deg, rgba(224, 122, 95, 0.2) 0%, rgba(129, 178, 154, 0.15) 100%);
  border: 1px solid rgba(212, 163, 115, 0.15);
}

.icon-bell {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23E07A5F' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'/%3E%3Cpath d='M13.73 21a2 2 0 0 1-3.46 0'/%3E%3C/svg%3E");
  background-size: 48px 48px;
  background-position: center;
  background-repeat: no-repeat;
}

.icon-share {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23E07A5F' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='18' cy='5' r='3'/%3E%3Ccircle cx='6' cy='12' r='3'/%3E%3Ccircle cx='18' cy='19' r='3'/%3E%3Cpath d='m8.59 13.51 6.82 3.98'/%3E%3Cpath d='M15.41 6.51l-6.82 3.98'/%3E%3C/svg%3E");
  background-size: 48px 48px;
  background-position: center;
  background-repeat: no-repeat;
}

// 右图左文的区块：图片贴左边（与左图右文形成“交错贴边”）
.feature-right {
  .feature-visual {
    justify-content: flex-start;
  }
}

// CTA 区
.cta-section {
  position: relative;
  margin: 48px 24px 0;
  padding: 64px 32px;
  background: linear-gradient(145deg, #E07A5F 0%, #D4A373 50%, #81B29A 100%);
  border-radius: pet.$pet-radius-xl;
  text-align: center;
  overflow: hidden;
}

.cta-noise {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n2'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n2)'/%3E%3C/svg%3E");
  opacity: 0.06;
  pointer-events: none;
  mix-blend-mode: overlay;
}

.cta-title {
  position: relative;
  z-index: 1;
  font-family: vars.$font-family-cute;
  font-size: clamp(24px, 4vw, 30px);
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.cta-desc {
  position: relative;
  z-index: 1;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 28px;
}

.cta-section .btn-primary {
  position: relative;
  z-index: 1;
  background: #fff;
  color: pet.$pet-primary;
}

.btn-large {
  padding: 16px 40px;
  font-size: 17px;
}

// 页脚
.landing-footer {
  padding: 32px 24px;
  text-align: center;
  border-top: 1px solid rgba(212, 163, 115, 0.15);
}

.landing-footer p {
  font-size: 13px;
  color: pet.$pet-warm-gray;
  margin: 0;
}

// 响应式
@media (max-width: 768px) {
  .hero-section {
    grid-template-columns: 1fr;
    padding: 100px 20px 48px;
    gap: 32px;
  }

  .hero-visual {
    order: -1;
    justify-content: center;
    padding-right: 0;
    margin-right: 0;
  }

  .hero-image {
    max-width: 320px;
    transform: rotate(-0.25deg) translateY(4px);
  }

  .paw-blob {
    right: 50%;
    transform: translate(50%, -50%);
  }

  .feature-block,
  .feature-right {
    grid-template-columns: 1fr;
    gap: 24px;
    margin-bottom: 48px;

    .feature-content,
    .feature-visual {
      order: unset;
    }
  }

  .feature-visual img {
    max-width: 100%;
  }

  .cta-section {
    margin: 32px 16px 0;
    padding: 48px 24px;
  }
}
</style>
