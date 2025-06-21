console.log("JavaScript está carregando...");

const root = document.getElementById("root");
if (root) {
  root.innerHTML = `
    <div style="
      min-height: 100vh; 
      background-color: #f0f0f0; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      font-family: Arial, sans-serif;
    ">
      <div style="
        background-color: white;
        padding: 40px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        text-align: center;
        max-width: 500px;
      ">
        <h1 style="color: #333; margin-bottom: 20px;">Hello World!</h1>
        <p style="color: #666; font-size: 18px;">A aplicação está funcionando!</p>
        <p style="color: #999; margin-top: 20px;">Sistema Financeiro - Versão de Teste</p>
        <button onclick="alert('Botão funcionando!')" style="
          background-color: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 20px;
          font-size: 16px;
        ">
          Clique para testar
        </button>
      </div>
    </div>
  `;
  console.log("HTML foi inserido com sucesso!");
} else {
  console.error("Elemento root não encontrado!");
}
