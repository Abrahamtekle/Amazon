// ===== PRICES =====
var prices = {
  kindle:    { dollars: '8',  cents: '99',  full: 8.99,  label: '$8.99'  },
  paperback: { dollars: '16', cents: '95',  full: 16.95, label: '$16.95' },
  hardcover: { dollars: '34', cents: '43',  full: 34.43, label: '$34.43' }
};

var currentFormat = 'paperback';

// ===== FORMAT SELECTOR =====
function selectFormat(format) {
  currentFormat = format;

  // Remove selected from all options
  document.querySelectorAll('.format-option').forEach(function(el) {
    el.classList.remove('selected');
  });
  document.querySelectorAll('.format-name').forEach(function(el) {
    el.classList.remove('selected-name');
  });
  document.querySelectorAll('.format-price').forEach(function(el) {
    el.classList.remove('selected-price');
  });

  // Highlight selected option
  var chosen = document.getElementById('fmt-' + format);
  if (chosen) {
    chosen.classList.add('selected');
    chosen.querySelector('.format-name').classList.add('selected-name');
    chosen.querySelector('.format-price').classList.add('selected-price');
  }

  // Update big price display
  var p = prices[format];
  document.querySelector('.main-price').innerHTML =
    '<sup>$</sup>' + p.dollars + '<sup class="cents">' + p.cents + '</sup>';

  // Update total cost
  updateTotal();

  // Show/hide delivery sections
  var shippingSection = document.getElementById('shipping-section');
  var kindleSection   = document.getElementById('kindle-section');

  if (format === 'kindle') {
    if (shippingSection) shippingSection.style.display = 'none';
    if (kindleSection)   kindleSection.style.display   = 'block';
  } else {
    if (shippingSection) shippingSection.style.display = 'block';
    if (kindleSection)   kindleSection.style.display   = 'none';
    updateDelivery();
  }
}

// ===== TOTAL COST (qty x price) =====
function updateTotal() {
  var qty       = parseInt(document.getElementById('qty-select').value) || 1;
  var p         = prices[currentFormat];
  var total     = (p.full * qty).toFixed(2);

  var totalEl   = document.getElementById('total-cost');
  var noteEl    = document.getElementById('unit-price-note');

  if (totalEl) totalEl.textContent = '$' + total;
  if (noteEl)  noteEl.textContent  = qty > 1 ? qty + ' x ' + p.label + ' each' : '';
}

// ===== POSTAL CODE → DELIVERY DAYS =====
function getDeliveryDays(postalCode) {
  var code  = postalCode.trim().toUpperCase().replace(/\s/g, '');
  var first = code.charAt(0);

  // Canada: first letter of postal code = province/region
  var map = {
    'T': 2,   // Alberta (Calgary, Edmonton)
    'V': 3,   // British Columbia (Vancouver)
    'S': 3,   // Saskatchewan
    'R': 4,   // Manitoba (Winnipeg)
    'M': 1,   // Ontario - Toronto
    'L': 2,   // Ontario - GTA
    'K': 2,   // Ontario East (Ottawa)
    'N': 2,   // Ontario Southwest
    'P': 4,   // Northern Ontario
    'H': 2,   // Quebec - Montreal
    'G': 3,   // Quebec City
    'J': 3,   // Quebec (other)
    'E': 5,   // New Brunswick
    'B': 5,   // Nova Scotia
    'C': 6,   // Prince Edward Island
    'A': 7,   // Newfoundland
    'X': 9,   // Northwest Territories / Nunavut
    'Y': 9    // Yukon
  };

  return map[first] || null;
}

function getDeliveryDate(days) {
  var date  = new Date();
  var added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    var d = date.getDay();
    if (d !== 0 && d !== 6) added++; // skip weekends
  }
  return date.toLocaleDateString('en-CA', {
    weekday: 'long', month: 'long', day: 'numeric'
  });
}

// ===== UPDATE DELIVERY SECTION =====
function updateDelivery() {
  var postalInput = document.getElementById('postal-input');
  var postalCode  = postalInput ? postalInput.value : 'T2R1C';
  var resultEl    = document.getElementById('delivery-result');

  if (!postalCode.trim()) {
    if (resultEl) resultEl.innerHTML =
      '<span style="color:#c00;">Please enter a postal code.</span>';
    return;
  }

  var days = getDeliveryDays(postalCode);

  if (!days) {
    if (resultEl) resultEl.innerHTML =
      '<span style="color:#c00;">&#10007; Invalid postal code. Try e.g. T2R1C or M5V2T6</span>';
    return;
  }

  var dateStr = getDeliveryDate(days);
  var plural  = days > 1 ? 'days' : 'day';

  if (resultEl) resultEl.innerHTML =
    '<div class="delivery-line">' +
      '<span class="delivery-icon">&#128666;</span>' +
      '<span>Arrives by <strong>' + dateStr + '</strong></span>' +
    '</div>' +
    '<div class="delivery-days-note">' +
      '&#128197; ' + days + ' business ' + plural + ' from now' +
    '</div>' +
    '<div class="delivery-free">&#10003; FREE delivery with Amazon Prime</div>';
}

// ===== ADD TO CART =====
function addToCart() {
  var qty   = parseInt(document.getElementById('qty-select').value) || 1;
  var p     = prices[currentFormat];
  var total = (p.full * qty).toFixed(2);

  var cartCount = document.querySelector('.cart-count');
  cartCount.textContent = (parseInt(cartCount.textContent) || 0) + qty;

  showToast('&#10003; Added ' + qty + ' x ' + p.label + ' = $' + total + ' to Cart!');
}

// ===== TOAST NOTIFICATION =====
function showToast(message) {
  var toast = document.getElementById('toast');
  toast.innerHTML = message;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 3000);
}

// ===== IMAGE HOVER ZOOM =====
function setupZoom() {
  var img    = document.getElementById('book-cover-img');
  var lens   = document.getElementById('zoom-lens');
  var result = document.getElementById('zoom-result');

  if (!img || !lens || !result) return;

  var ZOOM = 4;

  // Wait until image is fully loaded before setting up
  function init() {
    var iw = img.offsetWidth;
    var ih = img.offsetHeight;

    // Style the result box
    result.style.width            = '450px';
    result.style.height           = '500px';
    result.style.backgroundImage  = "url('" + img.src + "')";
    result.style.backgroundSize   = (iw * ZOOM) + 'px ' + (ih * ZOOM) + 'px';
    result.style.backgroundRepeat = 'no-repeat';
  }

  img.addEventListener('mouseenter', function() {
    init();
    lens.style.display   = 'block';
    result.style.display = 'block';
  });

  img.addEventListener('mouseleave', function() {
    lens.style.display   = 'none';
    result.style.display = 'none';
  });

  img.addEventListener('mousemove', function(e) {
    var rect = img.getBoundingClientRect();
    var mouseX = e.clientX - rect.left;
    var mouseY = e.clientY - rect.top;

    var iw = img.offsetWidth;
    var ih = img.offsetHeight;
    var lw = lens.offsetWidth;
    var lh = lens.offsetHeight;

    // Position lens centered on cursor, clamped to image bounds
    var lx = mouseX - lw / 2;
    var ly = mouseY - lh / 2;
    if (lx < 0) lx = 0;
    if (ly < 0) ly = 0;
    if (lx > iw - lw) lx = iw - lw;
    if (ly > ih - lh) ly = ih - lh;

    lens.style.left = lx + 'px';
    lens.style.top  = ly + 'px';

    // Shift background in result to match lens position
    var bgX = -(lx * ZOOM);
    var bgY = -(ly * ZOOM);
    result.style.backgroundPosition = bgX + 'px ' + bgY + 'px';
  });
}

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function() {

  // Follow buttons toggle
  document.querySelectorAll('.follow-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (this.classList.contains('following')) {
        this.classList.remove('following');
        this.textContent = 'Follow';
      } else {
        this.classList.add('following');
        this.textContent = 'Following ✓';
      }
    });
  });

  // Search button
  var searchBtn = document.querySelector('.search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      var q = document.querySelector('.search-input').value.trim();
      if (q) showToast('&#128269; Searching for: ' + q);
    });
  }

  // Buy Now
  var buyNow = document.querySelector('.buy-now-btn');
  if (buyNow) {
    buyNow.addEventListener('click', function() {
      showToast('&#128722; Proceeding to checkout...');
    });
  }

  // Join Prime
  var joinPrime = document.querySelector('.join-prime-btn');
  if (joinPrime) {
    joinPrime.addEventListener('click', function() {
      showToast('&#10024; Redirecting to Prime signup...');
    });
  }

  // Read Sample
  var readSample = document.querySelector('.read-sample-btn');
  if (readSample) {
    readSample.addEventListener('click', function() {
      showToast('&#128218; Loading sample pages...');
    });
  }

  // Quantity change → recalculate total
  var qtySelect = document.getElementById('qty-select');
  if (qtySelect) {
    qtySelect.addEventListener('change', function() {
      updateTotal();
    });
  }

  // Postal check button
  var postalBtn = document.getElementById('postal-btn');
  if (postalBtn) {
    postalBtn.addEventListener('click', function() {
      updateDelivery();
    });
  }

  // Postal input — press Enter to check
  var postalInput = document.getElementById('postal-input');
  if (postalInput) {
    postalInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') updateDelivery();
    });
  }

  // Init on load
  setupZoom();
  updateTotal();
  updateDelivery();
});
