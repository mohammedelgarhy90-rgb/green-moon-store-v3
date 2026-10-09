
(function () {
  function renderRelatedOffers() {
    if (!Array.isArray(window.products)) return;

    document.querySelectorAll('.gm-related-offers-auto').forEach(function (e) {
      e.remove();
    });

    window.products.forEach(function (product) {
      var offers = Array.isArray(product.relatedOffers)
        ? product.relatedOffers.filter(function (o) {
            return o &&
              o.active !== false &&
              Number(o.offerPrice) > 0;
          })
        : [];

      if (!offers.length) return;

      var cards = offers.map(function (offer) {
        var price = Number(offer.offerPrice) || 0;
        var oldPrice =
          Number(offer.oldPrice) ||
          Number(product.price) ||
          0;

        var needs = Array.isArray(offer.needs)
          ? offer.needs.join(' • ')
          : (offer.needs || offer.need || '');

        var duration =
          Math.max(
            1,
            Number(offer.durationMinutes) || 30
          );

        return `
          <div style="
            margin-top:12px;
            padding:14px;
            border:1px solid #dce9e1;
            border-radius:18px;
            background:linear-gradient(135deg,#ffffff,#f3faf6);
          ">
            <div style="
              font-size:16px;
              font-weight:800;
              color:#075c3d;
            ">
              🌿 ${product.name}
            </div>

            ${
              needs
                ? `
                <div style="
                  margin-top:6px;
                  font-size:12px;
                  color:#087842;
                ">
                  🎯 مناسب لـ: ${needs}
                </div>
                `
                : ''
            }

            ${
              offer.text
                ? `
                <div style="
                  margin-top:7px;
                  font-size:13px;
                  color:#596860;
                ">
                  ${offer.text}
                </div>
                `
                : ''
            }

            <div style="
              display:flex;
              align-items:center;
              justify-content:space-between;
              gap:10px;
              margin-top:12px;
            ">
              <div>
                <strong style="
                  font-size:21px;
                  color:#087842;
                ">
                  ${price} ج
                </strong>

                ${
                  oldPrice > price
                    ? `
                    <del style="
                      display:block;
                      font-size:12px;
                      color:#999;
                    ">
                      ${oldPrice} ج
                    </del>
                    `
                    : ''
                }
              </div>

              <button
                type="button"
                onclick="gmAddRelatedOffer(
                  '${String(product.id).replace(/'/g, "\\'")}',
                  '${String(offer.offerId || offer.id || '').replace(/'/g, "\\'")}'
                )"
                style="
                  border:0;
                  border-radius:12px;
                  padding:10px 14px;
                  background:#075c3d;
                  color:#fff;
                  font-weight:800;
                  cursor:pointer;
                "
              >
                أضف العرض 🛒
              </button>
            </div>

            <div style="
              margin-top:8px;
              font-size:11px;
              color:#8a958f;
            ">
              ⏱️ العرض لمدة ${duration} دقيقة
            </div>
          </div>
        `;
      }).join('');

      var box = document.createElement('div');

      box.className = 'gm-related-offers-auto';

      box.innerHTML = `
        <div style="
          margin:20px 0;
          padding:18px;
          border-radius:22px;
          background:#f7fbf8;
          border:1px solid #dfeae3;
        ">
          <div style="
            font-size:20px;
            font-weight:900;
            color:#075c3d;
          ">
            🌿 اقتراحات مناسبة ليك
          </div>

          <div style="
            margin-top:5px;
            font-size:12px;
            color:#68756e;
          ">
            اختيارات مقترحة حسب احتياجك
          </div>

          ${cards}
        </div>
      `;

      var target =
        document.querySelector('#products') ||
        document.querySelector('#productGrid');

      if (target) {
        target.parentNode.insertBefore(box, target);
      }
    });
  }

  window.gmAddRelatedOffer = function (productId, offerId) {

    var product =
      window.products.find(function (p) {
        return String(p.id) === String(productId);
      });

    if (!product) return;

    var offer =
      Array.isArray(product.relatedOffers)
        ? product.relatedOffers.find(function (o) {
            return String(o.offerId || o.id || '') === String(offerId);
          })
        : null;

    if (!offer || offer.active === false) return;

    if (typeof window.cart === 'undefined') {
      alert('تعذر فتح السلة');
      return;
    }

    var price = Number(offer.offerPrice) || 0;

    var existing =
      window.cart.find(function (item) {
        return String(item.id) === String(product.id) &&
          String(item.gmOfferId || '') === String(offerId);
      });

    if (existing) {
      existing.quantity += 1;
    } else {
      window.cart.push({
        id: product.id,
        name: product.name,
        price: price,
        oldPrice:
          Number(offer.oldPrice) ||
          Number(product.price) ||
          0,
        shippingPrice:
          Number(product.shippingPrice) || 0,
        image:
          product.image || '',
        quantity: 1,
        gmOfferId: String(offerId)
      });
    }

    if (typeof window.updateCart === 'function') {
      window.updateCart();
    }

    if (typeof window.openM === 'function') {
      window.openM('cartModal');
    }
  };

  setTimeout(renderRelatedOffers, 1500);

})();
  