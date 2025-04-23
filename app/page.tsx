import PongGame from "@/components/pong-game"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-950 text-gray-100">
      <h1 className="text-3xl font-bold text-white mb-6">Pong Multiplayer</h1>
      <PongGame />
      <div className="mt-6 text-white text-center game-controls">
        <p className="mb-2 text-lg font-semibold">Controles:</p>
        <p id="player1-controls">Modo Single Player: Use as setas para cima e para baixo</p>
        <p id="multiplayer-controls">Modo Multiplayer: Jogador 1 (W/S) e Jogador 2 (Setas)</p>
      </div>
    </main>
  )
}
