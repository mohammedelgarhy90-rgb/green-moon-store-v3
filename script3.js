
(function () {
  const splash = document.getElementById('gmPremiumSplash');
  if (!splash) return;

  /* ==============================
     PREMIUM CREATIVE SPLASH
     ============================== */

  const style = document.createElement('style');

  style.textContent = `
    #gmPremiumSplash.gm-creative-upgraded{
      background:
        radial-gradient(circle at 50% 40%,
          rgba(255,248,218,.22),
          transparent 20%),
        radial-gradient(circle at 15% 15%,
          rgba(231,191,98,.14),
          transparent 28%),
        linear-gradient(
          145deg,
          #01150e 0%,
          #064d38 48%,
          #011b13 100%
        ) !important;
    }

    /* قاعدة مضيئة خلف اللوجو */
    #gmPremiumSplash.gm-creative-upgraded .gm-logo-ring{
      background:
        radial-gradient(
          circle,
          rgba(255,251,232,.98) 0%,
          rgba(248,240,211,.94) 62%,
          rgba(231,191,98,.45) 100%
        ) !important;

      border-color:
        rgba(239,210,132,.9) !important;

      box-shadow:
        0 0 0 2px rgba(255,255,255,.55),
        0 0 35px rgba(255,229,157,.50),
        0 0 100px rgba(231,191,98,.20),
        0 25px 80px rgba(0,0,0,.42) !important;

      animation:
        gmCreativeLogo
        1.8s
        cubic-bezier(.16,1,.3,1)
        .15s
        both !important;
    }

    #gmPremiumSplash.gm-creative-upgraded .gm-logo{
      filter:
        drop-shadow(0 8px 18px rgba(0,0,0,.30));
      animation:
        gmLogoFloat
        4s
        ease-in-out
        2s
        infinite !important;
    }

    /* اسم الشركة */
    #gmPremiumSplash.gm-creative-upgraded .gm-company{
      animation:
        gmTextReveal
        1.15s
        cubic-bezier(.16,1,.3,1)
        1.15s
        both !important;

      text-shadow:
        0 3px 20px rgba(0,0,0,.45);
    }

    /* Plants and Flowers */
    #gmPremiumSplash.gm-creative-upgraded .gm-sub{
      animation:
        gmTextReveal
        1.15s
        cubic-bezier(.16,1,.3,1)
        1.5s
        both !important;

      opacity:.92 !important;
    }

    /* Mohamed Elgarhy — هادي */
    #gmPremiumSplash.gm-creative-upgraded .gm-name{
      font-size:14px !important;
      letter-spacing:2px !important;
      opacity:.58 !important;
      font-weight:500 !important;

      animation:
        gmTextReveal
        1s
        ease
        2s
        both !important;
    }

    /* ==============================
       ORBIT
       ============================== */

    .gm-creative-orbit{
      position:absolute;
      width:290px;
      height:290px;
      border-radius:50%;
      border:1px solid rgba(239,210,132,.28);
      z-index:1;
      pointer-events:none;
      animation:
        gmOrbit
        9s
        linear
        infinite;
    }

    .gm-creative-orbit::before,
    .gm-creative-orbit::after{
      content:"";
      position:absolute;
      inset:18px;
      border-radius:50%;
      border:1px solid rgba(255,255,255,.08);
    }

    .gm-creative-orbit::after{
      inset:42px;
      border-color:rgba(239,210,132,.14);
    }

    /* ==============================
       🌿 أوراق الشجر
       ============================== */

    .gm-creative-leaves{
      position:absolute;
      inset:0;
      overflow:hidden;
      pointer-events:none;
      z-index:4;
    }

    .gm-creative-leaf{
      position:absolute;
      width:19px;
      height:10px;
      border-radius:
        100% 0 100% 0;

      background:
        linear-gradient(
          135deg,
          #b5d879,
          #3c9455
        );

      opacity:0;
      box-shadow:
        0 3px 12px rgba(0,0,0,.18);

      animation:
        gmLeafFall
        linear
        infinite;
    }

    .gm-creative-leaf:nth-child(1){
      left:5%;
      animation-duration:7s;
      animation-delay:.3s;
    }

    .gm-creative-leaf:nth-child(2){
      left:17%;
      animation-duration:9s;
      animation-delay:1.8s;
    }

    .gm-creative-leaf:nth-child(3){
      left:31%;
      animation-duration:8s;
      animation-delay:2.7s;
    }

    .gm-creative-leaf:nth-child(4){
      left:48%;
      animation-duration:10s;
      animation-delay:.8s;
    }

    .gm-creative-leaf:nth-child(5){
      left:66%;
      animation-duration:8.5s;
      animation-delay:2s;
    }

    .gm-creative-leaf:nth-child(6){
      left:82%;
      animation-duration:7.5s;
      animation-delay:1.2s;
    }

    .gm-creative-leaf:nth-child(7){
      left:94%;
      animation-duration:9.5s;
      animation-delay:3s;
    }

    /* ==============================
       LOADING
       ============================== */

    .gm-creative-loader{
      position:absolute;
      left:50%;
      bottom:7%;
      transform:translateX(-50%);
      width:min(74vw,340px);
      text-align:center;
      z-index:7;
    }

    .gm-creative-percent{
      color:#f2d37d;
      font-size:19px;
      font-weight:800;
      letter-spacing:2px;
      margin-bottom:9px;
      text-shadow:
        0 2px 15px rgba(0,0,0,.45);
    }

    .gm-creative-track{
      width:100%;
      height:4px;
      overflow:hidden;
      border-radius:20px;
      background:
        rgba(255,255,255,.15);
      box-shadow:
        0 0 20px rgba(231,191,98,.12);
    }

    .gm-creative-fill{
      width:0%;
      height:100%;
      border-radius:20px;

      background:
        linear-gradient(
          90deg,
          #b88b35,
          #f1d47f,
          #fff2bd
        );

      box-shadow:
        0 0 15px rgba(248,223,145,.75);

      transition:
        width .08s linear;
    }

    .gm-creative-loading-text{
      margin-top:9px;
      color:rgba(255,255,255,.48);
      font-size:9px;
      letter-spacing:3px;
    }

    /* ==============================
       ANIMATIONS
       ============================== */

    @keyframes gmCreativeLogo{
      0%{
        opacity:0;
        transform:
          scale(.32)
          rotate(-18deg);
        filter:blur(14px);
      }

      55%{
        opacity:1;
        transform:
          scale(1.08)
          rotate(3deg);
        filter:blur(0);
      }

      100%{
        opacity:1;
        transform:
          scale(1)
          rotate(0);
      }
    }

    @keyframes gmLogoFloat{
      0%,100%{
        transform:translateY(0);
      }

      50%{
        transform:translateY(-7px);
      }
    }

    @keyframes gmTextReveal{
      from{
        opacity:0;
        transform:
          translateY(18px);
        filter:blur(8px);
      }

      to{
        opacity:1;
        transform:
          translateY(0);
        filter:blur(0);
      }
    }

    @keyframes gmOrbit{
      from{
        transform:
          rotate(0deg)
          scale(.88);
      }

      50%{
        transform:
          rotate(180deg)
          scale(1);
      }

      to{
        transform:
          rotate(360deg)
          scale(.88);
      }
    }

    @keyframes gmLeafFall{
      0%{
        opacity:0;
        transform:
          translate3d(0,-12vh,0)
          rotate(0deg)
          scale(.7);
      }

      12%{
        opacity:.85;
      }

      45%{
        transform:
          translate3d(75px,48vh,0)
          rotate(170deg)
          scale(1);
      }

      75%{
        transform:
          translate3d(-55px,78vh,0)
          rotate(285deg)
          scale(.9);
      }

      100%{
        opacity:0;
        transform:
          translate3d(80px,112vh,0)
          rotate(420deg)
          scale(.65);
      }
    }

    @media(max-width:520px){
      .gm-creative-orbit{
        width:250px;
        height:250px;
      }

      .gm-creative-loader{
        bottom:6%;
        width:76vw;
      }
    }
  `;

  document.head.appendChild(style);

  splash.classList.add('gm-creative-upgraded');

  /* ==============================
     ORBIT
     ============================== */

  const orbit = document.createElement('div');
  orbit.className = 'gm-creative-orbit';
  splash.appendChild(orbit);

  /* ==============================
     🌿 LEAVES
     ============================== */

  const leaves = document.createElement('div');
  leaves.className = 'gm-creative-leaves';

  for(let i = 0; i < 7; i++){
    const leaf = document.createElement('i');
    leaf.className = 'gm-creative-leaf';
    leaves.appendChild(leaf);
  }

  splash.appendChild(leaves);

  /* ==============================
     LOADER
     ============================== */

  const loader = document.createElement('div');
  loader.className = 'gm-creative-loader';

  loader.innerHTML = `
    <div class="gm-creative-percent">0%</div>

    <div class="gm-creative-track">
      <div class="gm-creative-fill"></div>
    </div>

    <div class="gm-creative-loading-text">
      GREEN MOON EXPERIENCE
    </div>
  `;

  splash.appendChild(loader);

  /* ==============================
     0 → 100%
     ============================== */

  const percent =
    loader.querySelector('.gm-creative-percent');

  const fill =
    loader.querySelector('.gm-creative-fill');

  const start =
    performance.now();

  const duration =
    900;

  function progress(now){

    const value =
      Math.min(
        100,
        Math.floor(
          ((now - start) / duration) * 100
        )
      );

    percent.textContent =
      value + '%';

    fill.style.width =
      value + '%';

    if(value < 100){
      requestAnimationFrame(progress);
    }
  }

  requestAnimationFrame(progress);

})();
  