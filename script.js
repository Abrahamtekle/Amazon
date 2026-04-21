// ===== PRICES =====
var prices = {
  kindle:    { dollars: '8',  cents: '99',  label: '$8.99'  },
  paperback: { dollars: '16', cents: '95',  label: '$16.95' },
  hardcover: { dollars: '34', cents: '43',  label: '$34.43' }
};

// ===== DELIVERY DAYS BY POSTAL CODE =====
function getDeliveryDays(postalCode) {
  if (!postalCode) return null;
  var code = postalCode.trim().toUpperCase().replace(/\s/g, '');
  var first = code.charAt(0);

  // Canada postal code first letter = province
  var deliveryMap = {
    'T': 2,  // Alberta
    'V': 3,  // British Columbia
    'S': 3,  // Saskatchewan
    'R': 4,  // Manitoba
    'M': 1,  // Toronto
    'L': 2,  // Ontario
    'K': 2,  // Ontario East
    'N': 2,  // Ontario SW
    'P': 4,  // Northern Ontario
    'H': 2,  // Montreal
    'G': 3,  // Quebec City
    'J': 3,  // Quebec
    'E': 5,  // New Brunswick
    'B': 5,  // Nova Scotia
    'C': 6,  // PEI
    'A': 6,  // Newfoundland
    'X': 8,  // Territories
    'Y': 8   // Yukon
  };

  var days = deliveryMap[first];
  if (!days) return null;
  return days;
}

function getDeliveryDate(days) {
  var date = new Date();
  var added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    var day = date.getDay();
    if (day !== 0 && day !== 6) added++; // skip weekends
  }
  var options = { weekday: 'long', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-CA', options);
}

// ===== UPDATE DELIVERY INFO =====
function updateDelivery() {
  var postalInput = document.getElementById('postal-input');
  var postalCode = postalInput ? postalInput.value : 'T2R1C';
  var days = getDeliveryDays(postalCode);
  var deliveryEl = document.getElementById('delivery-date');
  var daysEl = document.getElementById('delivery-days');

  if (!days) {
    if (deliveryEl) deliveryEl.textContent = 'Enter a valid Canadian postal code';
    if (daysEl) daysEl.textContent = '';
    return;
  }

  var dateStr = getDeliveryDate(days);
  if (deliveryEl) deliveryEl.textContent = dateStr;
  if (daysEl) daysEl.textContent = '(' + days + ' business day' + (days > 1 ? 's' : '') + ')';
}

// ===== FORMAT SELECTOR =====
var currentFormat = 'paperback';

function selectFormat(format) {
  currentFormat = format;

  // Remove selected from all
  document.querySelectorAll('.format-option').forEach(function(el) {
    el.classList.remove('selected');
  });
  document.querySelectorAll('.format-name').forEach(function(el) {
    el.classList.remove('selected-name');
  });
  document.querySelectorAll('.format-price').forEach(function(el) {
    el.classList.remove('selected-price');
  });

  // Apply selected
  var chosen = document.getElementById('fmt-' + format);
  if (chosen) {
    chosen.classList.add('selected');
    chosen.querySelector('.format-name').classList.add('selected-name');
    chosen.querySelector('.format-price').classList.add('selected-price');
  }

  // Update main price
  var p = prices[format];
  document.querySelector('.main-price').innerHTML =
    '<sup>$</sup>' + p.dollars + '<sup class="cents">' + p.cents + '</sup>';

  // Update total
  updateTotal();

  // Update delivery (Kindle = instant, others = shipping)
  var deliverySection = document.getElementById('shipping-section');
  var kindleSection = document.getElementById('kindle-section');

  if (format === 'kindle') {
    if (deliverySection) deliverySection.style.display = 'none';
    if (kindleSection) kindleSection.style.display = 'block';
  } else {
    if (deliverySection) deliverySection.style.display = 'block';
    if (kindleSection) kindleSection.style.display = 'none';
    updateDelivery();
  }
}

// ===== TOTAL COST =====
function updateTotal() {
  var qty = parseInt(document.getElementById('qty-select').value) || 1;
  var p = prices[currentFormat];
  var unitPrice = parseFloat(p.dollars + '.' + p.cents);
  var total = (unitPrice * qty).toFixed(2);
  var totalEl = document.getElementById('total-cost');
  if (totalEl) {
    totalEl.textContent = '$' + total;
  }
  var unitEl = document.getElementById('unit-price-note');
  if (unitEl && qty > 1) {
    unitEl.textContent = qty + ' x ' + p.label + ' each';
  } else if (unitEl) {
    unitEl.textContent = '';
  }
}

// ===== ADD TO CART =====
function addToCart() {
  var qty = parseInt(document.getElementById('qty-select').value) || 1;
  var cartCount = document.querySelector('.cart-count');
  cartCount.textContent = (parseInt(cartCount.textContent) || 0) + qty;
  var p = prices[currentFormat];
  var unitPrice = parseFloat(p.dollars + '.' + p.cents);
  var total = (unitPrice * qty).toFixed(2);
  showToast('&#10003; Added ' + qty + ' x ' + p.label + ' = $' + total);
}

// ===== TOAST =====
function showToast(message) {
  var toast = document.getElementById('toast');
  toast.innerHTML = message;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 3000);
}

// ===== IMAGE ZOOM =====
function setupZoom() {
  var coverImg = document.querySelector('.book-cover-img');
  if (!coverImg) return;
  var overlay = document.createElement('div');
  overlay.className = 'zoom-overlay';
  var zoomImg = document.createElement('img');
  zoomImg.src = coverImg.src;
  zoomImg.alt = 'Book cover zoom';
  overlay.appendChild(zoomImg);
  document.body.appendChild(overlay);
  coverImg.addEventListener('click', function() { overlay.classList.add('active'); });
  overlay.addEventListener('click', function() { overlay.classList.remove('active'); });
}

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function() {

  // Follow buttons
  document.querySelectorAll('.follow-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (this.classList.contains('following')) {
        this.classList.remove('following');
        this.textContent = 'Follow';
      } else {
        this.classList.add('following');
        this.textContent = 'Following';
      }
    });
  });

  // Search
  document.querySelector('.search-btn').addEventListener('click', function() {
    var q = document.querySelector('.search-input').value.trim();
    if (q) showToast('&#128269; Searching: ' + q);
  });

  // Buy Now
  document.querySelector('.buy-now-btn').addEventListener('click', function() {
    showToast('&#128722; Proceeding to checkout...');
  });

  // Join Prime
  document.querySelector('.join-prime-btn').addEventListener('click', function() {
    showToast('&#10024; Redirecting to Prime signup...');
  });

  // Read Sample
  document.querySelector('.read-sample-btn').addEventListener('click', function() {
    showToast('&#128218; Loading sample...');
  });

  // Qty change → update total
  document.getElementById('qty-select').addEventListener('change', function() {
    updateTotal();
  });

  // Postal code check button
  var postalBtn = document.getElementById('postal-btn');
  if (postalBtn) {
    postalBtn.addEventListener('click', function() {
      updateDelivery();
    });
  }

  // Postal code enter key
  var postalInput = document.getElementById('postal-input');
  if (postalInput) {
    postalInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') updateDelivery();
    });
  }

  // Init
  setupZoom();
  updateTotal();
  updateDelivery();
});
