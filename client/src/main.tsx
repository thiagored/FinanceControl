import { createRoot } from "react-dom/client";
import "./index.css";

function SimpleApp() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          textAlign: 'center', 
          marginBottom: '1.5rem',
          color: '#1f2937'
        }}>
          Sistema Financeiro
        </h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '0.25rem'
            }}>
              Email
            </label>
            <input 
              type="email" 
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                outline: 'none'
              }}
              placeholder="seu@email.com"
            />
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '0.25rem'
            }}>
              Senha
            </label>
            <input 
              type="password" 
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                outline: 'none'
              }}
              placeholder="••••••••"
            />
          </div>
          
          <button style={{
            width: '100%',
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '0.75rem',
            borderRadius: '6px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            Entrar
          </button>
          
          <p style={{ 
            textAlign: 'center', 
            fontSize: '0.875rem', 
            color: '#6b7280' 
          }}>
            Não tem conta? 
            <a href="#" style={{ color: '#2563eb', textDecoration: 'none', marginLeft: '0.25rem' }}>
              Cadastre-se
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<SimpleApp />);
