import { Link } from 'react-router-dom';
import { UtensilsCrossed, Share2, Heart, MessageCircle, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div className="footer-brand-name">
              <UtensilsCrossed size={22} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Saveur<span>Eats</span>
            </div>
            <p className="footer-desc">
              Bringing premium restaurant-quality dining to your doorstep. 
              Fresh ingredients, master chefs, lightning-fast delivery.
            </p>
            {/* Social */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
            {[Share2, Heart, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--clr-gold)'; e.currentTarget.style.color = '#222'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div className="footer-heading">Quick Links</div>
            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/menu">Menu</Link>
              <Link to="/cart">Cart</Link>
              <Link to="/orders">My Orders</Link>
              <Link to="/profile">Profile</Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className="footer-heading">Categories</div>
            <div className="footer-links">
              <a href="#">🍔 Burgers</a>
              <a href="#">🍕 Pizza</a>
              <a href="#">🍣 Sushi</a>
              <a href="#">🍝 Pasta</a>
              <a href="#">🍰 Desserts</a>
            </div>
          </div>

          {/* Contact */}
          <div id="about">
            <div className="footer-heading">Contact Us</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { Icon: MapPin, text: '123 Gourmet Lane, Food City, FC 10001' },
                { Icon: Phone, text: '+1 (555) 123-4567' },
                { Icon: Mail,  text: 'hello@saveureats.com' },
              ].map(({ Icon, text }) => (
                <div key={text} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)' }}>
                  <Icon size={15} style={{ flexShrink: 0, marginTop: 2, color: 'var(--clr-gold)' }} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2024 SaveurEats. All rights reserved.</span>
          <span>Built with ❤️ for food lovers everywhere</span>
        </div>
      </div>
    </footer>
  );
}
