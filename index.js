const d = document,
    $tacos = d.getElementById("tacos"),
    $template = d.getElementById("taco-template").content,
    $fragment = d.createDocumentFragment(),
    fetchOption = { headers:{
        Authorization:"Bearer YOUR-TOKEN-PUBLIC"
    }
};

let products, prices;

const DEFAULT = (num) => num.slice(0,-2);

Promise.all([
    fetch("https://api.stripe.com/v1/products", fetchOption),
    fetch("https://api.stripe.com/v1/prices", fetchOption)
])
.then((responses)=>{
    return Promise.all(responses.map((res)=> res.json()));
})
.then((json) =>{
    //console.log(json);
    products = json[0].data;
    prices = json[1].data;
    //console.log(products,prices);

    prices.forEach((el)=>{
        let productsData = products.filter((product)=> product.id === el.product);
        //console.log(productsData);

        $template.querySelector('.taco').setAttribute("data-price", el.id);
        $template.querySelector('.taco').setAttribute("data-type", el.type);
        $template.querySelector('.img').src = productsData[0].images;
        $template.querySelector('.img').alt = productsData[0].name;
        $template.querySelector('.figcaption').textContent = `${productsData[0].name} ---- $${DEFAULT(el.unit_amount_decimal)}.00 ${el.currency}`

        let $clone = d.importNode($template,true);
        $fragment.appendChild($clone);
    });

    $tacos.appendChild($fragment);
})


d.addEventListener("click", (e)=>{

    if(e.target.matches(".taco *")){
        //console.log(e.target);
        //alert("hello, mom");
        let priceId = e.target.parentElement.getAttribute("data-price"),
            type = e.target.parentElement.getAttribute("data-type");
        
        if(type === "one_time"){
            let cantidad = prompt("¿Cuánto del mismo producto quieres? Ej: 1, 2, 5....");
            
            Stripe("YOUR-TOKEN-SECRET")
            .redirectToCheckout({
                lineItems: [{price:priceId, quantity:parseInt(`${cantidad}`)}],
                mode:"payment",
                successUrl:"http://127.0.0.1:5500/assets/stripe-sucess.html",
                cancelUrl:"http://127.0.0.1:5500/assets/stripe-cancel.html"
            })
        }

        if(type === "recurring"){
            Stripe("YOUR-TOKEN-SECRET")
            .redirectToCheckout({
                lineItems: [{price:priceId, quantity:1}],
                mode:"subscription",
                successUrl:"http://127.0.0.1:5500/assets/stripe-sucess.html",
                cancelUrl:"http://127.0.0.1:5500/assets/stripe-cancel.html"
            })
        }
    }
})
