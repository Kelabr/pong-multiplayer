import PongGame from "@/components/pong-game"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-950 text-gray-900">
      <h1 className="text-3xl font-bold text-white mb-6">Pong Multiplayer</h1>
      <PongGame />
      <div className="mt-6 text-white text-center">
        <p className="mb-2 text-lg font-semibold">Controles:</p>
        <p>Jogador 1: "W" (cima) e "S" (baixo)</p>
        <p>Jogador 2: Seta para cima e Seta para baixo</p>
      </div>
    </main>
  )
}
