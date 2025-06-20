function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Sistema Financeiro</h1>
          <p className="text-center text-gray-600 mb-4">Carregando aplicação...</p>
          <div className="text-center">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
