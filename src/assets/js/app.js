// all javascript here must be compatible to run on browser

// alpine persist
(()=>{function p(e){e.magic("persist",(t,{interceptor:l})=>{let o,i=localStorage;return l((r,n,s,m,S)=>{let a=o||`_x_${m}`,u=c(a,i)?d(a,i):r;return s(u),e.effect(()=>{let g=n();f(a,g,i),s(g)}),u},r=>{r.as=n=>(o=n,r),r.using=n=>(i=n,r)})})}function c(e,t){return t.getItem(e)!==null}function d(e,t){return JSON.parse(t.getItem(e,t))}function f(e,t,l){l.setItem(e,JSON.stringify(t))}document.addEventListener("alpine:init",()=>{window.Alpine.plugin(p)});})();

// load service worker
if ("serviceWorker" in navigator) navigator.serviceWorker.register('/sw.js', {scope: '/'});

// algolia
// https://www.algolia.com/doc/ui-libraries/autocomplete/introduction/getting-started/
window.onload = function() {
  var ajs = window['@algolia/autocomplete-js'];
  var searchClient = algoliasearch('705YCYXSX9', 'cde7bb574f3bce1255cbed47e382782a');
  if (document.querySelectorAll('#autocomplete').length == 0) return;
  ajs.autocomplete({
    container: '#autocomplete',
    placeholder: 'Cari artikel',
    getSources: function(event) {
      query = event.query;
      return [{
        sourceId: 'articles',
        getItems: () => ajs.getAlgoliaResults({
          searchClient,
          queries: [ { indexName: 'articles', query, params: { hitsPerPage: 12 } } ],
        }),
        getItemUrl(data) {
          return `${window.location.protocol}//${window.location.host}`
            +`/artikel/${data.item.title.replace(/\W+/g, '-').toLowerCase()}`;
        },
        templates: {
          item: function(data) {
            return data.html`
              <a class="aa-ItemWrapper"
                href="${window.location.protocol}//${window.location.host}/artikel/${data.item.title.replace(/\W+/g, '-').toLowerCase()}"
              >
                <div class="aa-ItemContent" style="margin:0.5rem 0">
                  <div style="width:128px;height:100%">
                    <img src="${data.item.cover}" alt="Gambar Cover Artikel"
                      style="width:auto;height:100%;border-radius:0.8rem;object-fit:cover" />
                  </div>
                  <div class="aa-ItemContentBody">
                    <div class="aa-ItemContentTitle">
                      <b>${data.components.Highlight({
                        hit: data.item,
                        attribute: 'title',
                      })}</b>
                    </div>
                    <div class="aa-ItemContentDescription">
                      ${data.components.Snippet({
                        hit: data.item,
                        attribute: 'excerpt',
                      })}
                    </div>
                  </div>
                  <div class="aa-ItemActions">
                    <button class="aa-ItemActionButton aa-DesktopOnly aa-ActiveOnly" type="button" title="Pilih">
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" >
                        <path d="M18.984 6.984h2.016v6h-15.188l3.609 3.609-1.406 1.406-6-6 6-6 1.406 1.406-3.609 3.609h13.172v-4.031z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </a>
            `;
          },
        },
      }];
    },
  });
};
