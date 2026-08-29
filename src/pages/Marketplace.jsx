import { useState, useMemo } from 'react'
import Icon from '../components/icons.jsx'
import { useResource } from '../hooks/useResource.js'
import { products as mockProducts, productCategories } from '../data/mockData.js'
import './dash.css'
import './Marketplace.css'

export default function Marketplace() {
  const { data: products } = useResource('/products', mockProducts)
  const [category, setCategory] = useState('All')
  const [cart, setCart] = useState({}) // in-memory only (id -> qty)

  const visible = useMemo(
    () => (category === 'All' ? products : products.filter((p) => p.category === category)),
    [products, category]
  )

  const add = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }))
  const remove = (id) =>
    setCart((c) => {
      const next = { ...c }
      if (!next[id]) return c
      next[id] -= 1
      if (next[id] <= 0) delete next[id]
      return next
    })

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)
  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find((x) => x.id === id)
    return sum + (p ? p.price * qty : 0)
  }, 0)

  return (
    <div className="market-page">
      <div className="market-toolbar">
        <div className="market-cats">
          {productCategories.map((c) => (
            <button
              key={c}
              className={`market-cat ${category === c ? 'is-active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="market-cart-pill">
          <Icon name="cart" size={17} />
          <span className="market-cart-count mono">{cartCount}</span>
          <span className="market-cart-divider" />
          <span className="market-cart-total mono">₦{cartTotal.toLocaleString()}</span>
        </div>
      </div>

      <div className="market-grid">
        {visible.map((p) => {
          const qty = cart[p.id] || 0
          const up = p.trend >= 0
          return (
            <article key={p.id} className="product-card">
              <div className="product-thumb">
                <Icon name="sprout" size={30} />
                <span className="product-grade mono">{p.grade}</span>
              </div>
              <div className="product-body">
                <div className="product-top">
                  <h3 className="product-name">{p.name}</h3>
                  <span className={`product-trend ${up ? 'is-up' : 'is-down'}`}>
                    <Icon name={up ? 'trending-up' : 'trending-down'} size={13} />
                    {up ? '+' : ''}{p.trend}%
                  </span>
                </div>
                <span className="product-seller">
                  <Icon name="map-pin" size={12} /> {p.seller}
                </span>

                <div className="product-price-row">
                  <span className="product-price mono">
                    ₦{p.price}
                    <span className="product-unit">/{p.unit}</span>
                  </span>
                  <span className="product-stock">{p.stock.toLocaleString()} {p.unit} in stock</span>
                </div>

                {qty === 0 ? (
                  <button className="btn btn-dark btn-block btn-sm" onClick={() => add(p.id)}>
                    <Icon name="plus" size={15} /> Add to cart
                  </button>
                ) : (
                  <div className="product-stepper">
                    <button onClick={() => remove(p.id)} aria-label="Remove one">
                      <Icon name="minus" size={15} />
                    </button>
                    <span className="product-qty mono">{qty} in cart</span>
                    <button onClick={() => add(p.id)} aria-label="Add one">
                      <Icon name="plus" size={15} />
                    </button>
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
