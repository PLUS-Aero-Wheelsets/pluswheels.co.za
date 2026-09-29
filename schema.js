/* ============================================================
   PLUS AERO - Schema / JSON-LD Auto-Injector
   One file, every page. Add this line before </body>:
   <script src="schema.js"></script>
   ============================================================ */

(function () {
  'use strict';

  var BASE = 'https://pluswheels.co.za';
  var path = window.location.pathname.replace(/\.html$/,'').replace(/\/$/,'') || '/';
  var slug = path === '/' ? 'index' : path.split('/').pop();

  /* ---- helpers ---- */
  function inject(obj) {
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.text = JSON.stringify(obj);
    document.head.appendChild(s);
  }
  function text(sel) {
    var el = document.querySelector(sel);
    return el ? el.textContent.trim() : '';
  }
  function priceFromText(str) {
    var m = str.match(/R[\s]*([\d,]+)/);
    return m ? m[1].replace(/,/g,'') : '';
  }

  /* ---- 1. Organization + LocalBusiness (all pages) ---- */
  var org = {
    '@context':'https://schema.org',
    '@type':['Organization','LocalBusiness'],
    '@id':BASE+'/#organization',
    name:'PLUS Aero Wheelsets',
    alternateName:'PLUS Aero Bicycle Wheels and Components',
    description:'Hand-built carbon wheelsets, QO Bike Components distributor, and precision bearings for road, gravel and MTB. Built in Johannesburg, South Africa.',
    url:BASE,
    logo:BASE+'/logo-plus.png',
    image:BASE+'/logo-plus.png',
    telephone:'+27-83-882-1308',
    email:'info@pluswheels.co.za',
    priceRange:'R R R R',
    address:{
      '@type':'PostalAddress',
      streetAddress:'983 Meadowbrook Business Estate, off Jacaranda Avenue',
      addressLocality:'Olivedale, Johannesburg',
      addressRegion:'Gauteng',
      postalCode:'2158',
      addressCountry:'ZA'
    },
    contactPoint:[{
      '@type':'ContactPoint',
      telephone:'+27-83-882-1308',
      contactType:'sales',
      availableLanguage:['en'],
      contactOption:'TollFree'
    }],
    sameAs:[
      'https://www.instagram.com/plusaero',
      'https://www.facebook.com/plusaero'
    ],
    areaServed:{'@type':'Country','name':'South Africa'},
    knowsAbout:['carbon wheelsets','bicycle wheels','road cycling','gravel cycling','mountain biking','ceramic bearings','bottom brackets','OSPW','bicycle hubs','bicycle spokes']
  };
  inject(org);

  /* ---- 2. WebSite schema (homepage only) ---- */
  if (slug === 'index') {
    inject({
      '@context':'https://schema.org',
      '@type':'WebSite',
      '@id':BASE+'/#website',
      url:BASE,
      name:'PLUS Aero Wheelsets',
      publisher:{'@id':BASE+'/#organization'},
      inLanguage:'en-ZA'
    });
  }

  /* ---- 3. BreadcrumbList (all pages except homepage) ---- */
  if (slug !== 'index') {
    var crumbs = [{name:'Home',url:BASE+'/'}];
    var labels = {
      road:'Road Wheelsets', gravel:'Gravel Wheelsets', mtb:'MTB Wheelsets',
      g5silk:'G5 Silk', qocranks:'QO Bike Gear', components:'Components',
      workshop:'Workshop', basement983:'Basement 983', support:'Support',
      'qo-product':'QO Product', 'components-product':'Component'
    };
    var label = labels[slug] || slug.replace(/-/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase()});
    crumbs.push({name:label, url:BASE+'/'+slug+'.html'});
    var bl = {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[]};
    crumbs.forEach(function(c,i){
      bl.itemListElement.push({'@type':'ListItem',position:i+1,name:c.name,item:c.url});
    });
    inject(bl);
  }

  /* ---- 4. ItemList on category pages ---- */
  var catPages = ['road','gravel','mtb','qocranks','components','g5silk'];
  if (catPages.indexOf(slug) > -1) {
    var items = [];
    var cards = document.querySelectorAll('.product-card');
    cards.forEach(function(card,i){
      var h3 = card.querySelector('h3');
      var name = h3 ? h3.textContent.trim() : ('Product '+(i+1));
      var priceEl = card.querySelector('.base-price');
      var price = priceEl ? priceEl.textContent.trim() : '';
      var img = card.querySelector('.card-img');
      var imgStyle = img ? img.getAttribute('style') || '' : '';
      var imgMatch = imgStyle.match(/url\(['"]?([^'"\)]+)['"]?\)/);
      var imgUrl = imgMatch ? (imgMatch[1].indexOf('http')===0 ? imgMatch[1] : BASE+'/'+imgMatch[1]) : BASE+'/logo-plus.png';
      items.push({
        '@type':'ListItem',
        position:i+1,
        item:{
          '@type':'Product',
          name:name,
          brand:{'@type':'Brand',name:'PLUS Aero'},
          image:imgUrl,
          offers:{'@type':'Offer',priceCurrency:'ZAR',price:priceFromText(price)||'0',availability:'https://schema.org/InStock',seller:{'@id':BASE+'/#organization'}}
        }
      });
    });
    if (items.length) {
      inject({'@context':'https://schema.org','@type':'ItemList',name:label+' - PLUS Aero',itemListElement:items});
    }
  }

  /* ---- 5. Product schema on qo-product.html ---- */
  if (slug === 'qo-product' && typeof window.PRODUCTS !== 'undefined') {
    var key = new URLSearchParams(window.location.search).get('product');
    var p = window.PRODUCTS[key] || window.PRODUCTS['race-black'];
    if (p) {
      inject({
        '@context':'https://schema.org',
        '@type':'Product',
        name:p.name,
        brand:{'@type':'Brand',name:'QO Bike Gear'},
        description:'QO '+p.cat+' - available exclusively in South Africa from PLUS Aero.',
        image:p.img,
        offers:{
          '@type':'Offer',
          priceCurrency:'ZAR',
          price:priceFromText(p.price)||'0',
          availability:'https://schema.org/InStock',
          seller:{'@id':BASE+'/#organization'},
          url:BASE+'/qo-product.html?product='+key
        },
        warrantyPromise:{'@type':'WarrantyPromise',durationOfWarranty:'P3Y',warrantyScope:'https://schema.org/MerchantReturnFiniteReturnWindow'}
      });
    }
  }

  /* ---- 6. Product schema on components-product.html ---- */
  if (slug === 'components-product' && typeof window.PRODUCTS !== 'undefined') {
    var ckey = new URLSearchParams(window.location.search).get('product');
    var cp = window.PRODUCTS[ckey] || window.PRODUCTS['grx600'];
    if (cp) {
      inject({
        '@context':'https://schema.org',
        '@type':'Product',
        name:cp.name,
        brand:{'@type':'Brand',name:'PLUS Aero'},
        description:cp.cat+' - supplied and fitted by PLUS Aero, Johannesburg.',
        image:cp.img.indexOf('http')===0 ? cp.img : BASE+'/'+cp.img,
        offers:{
          '@type':'Offer',
          priceCurrency:'ZAR',
          price:priceFromText(cp.price)||'0',
          availability:'https://schema.org/InStock',
          seller:{'@id':BASE+'/#organization'},
          url:BASE+'/components-product.html?product='+ckey
        }
      });
    }
  }

  /* ---- 7. Product schema on static product detail pages ---- */
  var productSlugs = ['axl-20','axl-24','csl','rsl-50','rsl-40','gsl','gsl-54','gsl-r','xsl-xco','esl','vsl-50'];
  if (productSlugs.indexOf(slug) > -1) {
    var pName = text('h1') || text('.detail-info h1') || slug.toUpperCase();
    var pPrice = priceFromText(text('.base-price') || text('.detail-price') || text('.specs-brief') || '');
    var pImg = (function(){
      var img = document.querySelector('.product-image img');
      if (img) { var s = img.getAttribute('src')||''; if (s) return s.indexOf('http')===0 ? s : BASE+'/'+s; }
      var card = document.querySelector('.card-img');
      if (card) { var s2 = card.getAttribute('style')||''; var m2 = s2.match(/url\(['"]?([^'"\)]+)['"]?\)/); if (m2) return m2[1].indexOf('http')===0 ? m2[1] : BASE+'/'+m2[1]; }
      return BASE+'/logo-plus.png';
    })();
    inject({
      '@context':'https://schema.org',
      '@type':'Product',
      name:pName,
      brand:{'@type':'Brand',name:'PLUS Aero'},
      image:pImg,
      category:'Bicycle Wheels',
      offers:{
        '@type':'Offer',
        priceCurrency:'ZAR',
        price:pPrice||'0',
        availability:'https://schema.org/InStock',
        seller:{'@id':BASE+'/#organization'},
        url:BASE+'/'+slug+'.html'
      }
    });
  }

})();
