"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMobile } from "@/hooks/use-mobile"

type GameMode = "single" | "multi" | null

export default function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [player1Score, setPlayer1Score] = useState(0)
  const [player2Score, setPlayer2Score] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [showModeSelection, setShowModeSelection] = useState(true)
  const [showNameForm, setShowNameForm] = useState(false)
  const [gameMode, setGameMode] = useState<GameMode>(null)
  const [player1Name, setPlayer1Name] = useState("Jogador 1")
  const [player2Name, setPlayer2Name] = useState("Computador")
  const [tempPlayer1Name, setTempPlayer1Name] = useState("Jogador 1")
  const [tempPlayer2Name, setTempPlayer2Name] = useState("Jogador 2")

  const isMobile = useMobile()

  const handleModeSelection = (mode: GameMode) => {
    setGameMode(mode)
    setShowModeSelection(false)
    setShowNameForm(true)

    if (mode === "single") {
      setTempPlayer1Name("Jogador")
      setTempPlayer2Name("Computador")
    }
  }

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault()
    setPlayer1Name(tempPlayer1Name || "Jogador 1")

    if (gameMode === "multi") {
      setPlayer2Name(tempPlayer2Name || "Jogador 2")
    } else {
      setPlayer2Name("Computador")
    }

    setShowNameForm(false)
  }

  const restartGame = () => {
    setPlayer1Score(0)
    setPlayer2Score(0)
    setGameOver(false)
    setGameStarted(false)
    setShowModeSelection(true)
    setShowNameForm(false)
    setGameMode(null)
  }

  useEffect(() => {
    if (showModeSelection || showNameForm) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Adjust canvas size for mobile
    if (isMobile) {
      canvas.width = Math.min(window.innerWidth - 40, 500)
      canvas.height = canvas.width * 0.625 // Maintain aspect ratio
    } else {
      canvas.width = 800
      canvas.height = 500
    }

    // Game objects
    const paddleWidth = 15
    const paddleHeight = canvas.height / 5 // Adjust paddle height based on canvas size
    const ballSize = 15
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33F3", "#33FFF3"]
    let currentColorIndex = 0
    let colorChangeTimer = 0

    // Paddles
    const player1 = {
      x: 50,
      y: canvas.height / 2 - paddleHeight / 2,
      width: paddleWidth,
      height: paddleHeight,
      score: 0,
      dy: 0,
      speed: canvas.height / 60, // Adjust speed based on canvas size
    }

    const player2 = {
      x: canvas.width - 50 - paddleWidth,
      y: canvas.height / 2 - paddleHeight / 2,
      width: paddleWidth,
      height: paddleHeight,
      score: 0,
      dy: 0,
      speed: canvas.height / 60,
      targetY: canvas.height / 2, // Initialize target position
      predictionOffset: 0, // For ball trajectory prediction
    }

    // Ball
    const ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      size: ballSize,
      dx: canvas.width / 160, // Adjust speed based on canvas size
      dy: canvas.width / 160,
      speed: canvas.width / 160,
    }

    // Key states
    const keys = {
      w: false,
      s: false,
      ArrowUp: false,
      ArrowDown: false,
    }

    // Event listeners for key presses
    const keyDownHandler = (e: KeyboardEvent) => {
      if (
        e.key === "w" ||
        e.key === "W" ||
        e.key === "s" ||
        e.key === "S" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown"
      ) {
        e.preventDefault()
      }

      // In single player mode, player uses arrow keys
      if (gameMode === "single") {
        if (e.key === "ArrowUp") keys.ArrowUp = true
        if (e.key === "ArrowDown") keys.ArrowDown = true
      } else {
        // In multiplayer mode, player 1 uses W/S, player 2 uses arrows
        if (e.key === "w" || e.key === "W") keys.w = true
        if (e.key === "s" || e.key === "S") keys.s = true
        if (e.key === "ArrowUp") keys.ArrowUp = true
        if (e.key === "ArrowDown") keys.ArrowDown = true
      }

      if (!gameStarted) {
        setGameStarted(true)
      }
    }

    const keyUpHandler = (e: KeyboardEvent) => {
      if (gameMode === "single") {
        if (e.key === "ArrowUp") keys.ArrowUp = false
        if (e.key === "ArrowDown") keys.ArrowDown = false
      } else {
        if (e.key === "w" || e.key === "W") keys.w = false
        if (e.key === "s" || e.key === "S") keys.s = false
        if (e.key === "ArrowUp") keys.ArrowUp = false
        if (e.key === "ArrowDown") keys.ArrowDown = false
      }
    }

    window.addEventListener("keydown", keyDownHandler)
    window.addEventListener("keyup", keyUpHandler)

    // Predict where the ball will be when it reaches the AI's x position
    const predictBallPosition = () => {
      // Only predict when ball is moving towards AI
      if (ball.dx <= 0) return ball.y

      // Calculate time until ball reaches AI's x position
      const distanceX = player2.x - ball.x
      const timeToReach = distanceX / ball.dx

      // Predict y position
      let predictedY = ball.y + ball.dy * timeToReach

      // Account for bounces
      const bounces = Math.floor(predictedY / canvas.height)
      if (bounces % 2 === 0) {
        predictedY = predictedY % canvas.height
      } else {
        predictedY = canvas.height - (predictedY % canvas.height)
      }

      // Add some imperfection to the prediction
      return predictedY + player2.predictionOffset
    }

    // Update paddle positions based on key presses
    const updatePaddles = () => {
      if (gameMode === "single") {
        // In single player mode, player controls paddle with arrow keys
        if (keys.ArrowUp) {
          player1.dy = -player1.speed
        } else if (keys.ArrowDown) {
          player1.dy = player1.speed
        } else {
          player1.dy = 0
        }

        // AI controls the second paddle - more challenging but still beatable
        const paddleCenter = player2.y + player2.height / 2

        // Update prediction offset occasionally to simulate imperfect prediction
        if (Math.random() < 0.02) {
          player2.predictionOffset = Math.random() * 30 - 15 // Random offset between -15 and 15
        }

        // Predict ball position and set target
        if (ball.dx > 0 || ball.x > canvas.width * 0.6) {
          // Ball is moving towards AI or is in AI's half of the court
          const predictedY = predictBallPosition()

          // Update target position occasionally to maintain fluid movement
          if (Math.random() < 0.05) {
            player2.targetY = predictedY
          }
        } else {
          // Ball is moving away, return to a neutral position with some randomness
          if (Math.random() < 0.02) {
            player2.targetY = canvas.height / 2 + (Math.random() * 60 - 30)
          }
        }

        // Occasionally make mistakes (about 3% of the time)
        const makesMistake = Math.random() < 0.03 && ball.x > canvas.width * 0.7

        if (makesMistake) {
          // Move in wrong direction, but smoothly
          player2.dy = -Math.sign(player2.targetY - paddleCenter) * player2.speed * 0.6
        } else {
          // Smooth movement towards target
          const distanceToTarget = player2.targetY - paddleCenter

          if (Math.abs(distanceToTarget) > 5) {
            // Proportional speed based on distance (creates acceleration/deceleration)
            const speedFactor = Math.min(Math.abs(distanceToTarget) / 50, 1) * 0.8
            player2.dy = Math.sign(distanceToTarget) * player2.speed * speedFactor
          } else {
            // Close enough to target, slow down
            player2.dy = 0
          }
        }

        // Limit AI movement to 85% of the court height (increased from 80%)
        const aiLimitTop = canvas.height * 0.075
        const aiLimitBottom = canvas.height * 0.925 - player2.height
        if (player2.y < aiLimitTop) player2.y = aiLimitTop
        if (player2.y > aiLimitBottom) player2.y = aiLimitBottom
      } else {
        // Multiplayer mode - both paddles controlled by players
        // Player 1 (W and S)
        if (keys.w) {
          player1.dy = -player1.speed
        } else if (keys.s) {
          player1.dy = player1.speed
        } else {
          player1.dy = 0
        }

        // Player 2 (Arrow keys)
        if (keys.ArrowUp) {
          player2.dy = -player2.speed
        } else if (keys.ArrowDown) {
          player2.dy = player2.speed
        } else {
          player2.dy = 0
        }
      }

      // Update positions
      player1.y += player1.dy
      player2.y += player2.dy

      // Keep paddles within canvas
      if (player1.y < 0) player1.y = 0
      if (player1.y + player1.height > canvas.height) player1.y = canvas.height - player1.height
      if (player2.y < 0) player2.y = 0
      if (player2.y + player2.height > canvas.height) player2.y = canvas.height - player2.height
    }

    // Update ball position and handle collisions
    const updateBall = () => {
      if (!gameStarted) return

      ball.x += ball.dx
      ball.y += ball.dy

      // Collision with top and bottom walls
      if (ball.y - ball.size / 2 < 0 || ball.y + ball.size / 2 > canvas.height) {
        ball.dy = -ball.dy
      }

      // Collision with paddles
      if (
        ball.x - ball.size / 2 < player1.x + player1.width &&
        ball.x + ball.size / 2 > player1.x &&
        ball.y + ball.size / 2 > player1.y &&
        ball.y - ball.size / 2 < player1.y + player1.height
      ) {
        ball.dx = Math.abs(ball.dx) // Move right
        // Add some variation to the bounce angle
        ball.dy = ((ball.y - (player1.y + player1.height / 2)) / (player1.height / 2)) * ball.speed
      }

      if (
        ball.x + ball.size / 2 > player2.x &&
        ball.x - ball.size / 2 < player2.x + player2.width &&
        ball.y + ball.size / 2 > player2.y &&
        ball.y - ball.size / 2 < player2.y + player2.height
      ) {
        ball.dx = -Math.abs(ball.dx) // Move left
        // Add some variation to the bounce angle
        ball.dy = ((ball.y - (player2.y + player2.height / 2)) / (player2.height / 2)) * ball.speed
      }

      // Ball out of bounds - scoring
      if (ball.x < 0) {
        // Player 2 scores
        player2.score++
        setPlayer2Score(player2.score)
        if (player2.score >= 5) {
          setGameOver(true)
        } else {
          resetBall()
        }
      } else if (ball.x > canvas.width) {
        // Player 1 scores
        player1.score++
        setPlayer1Score(player1.score)
        if (player1.score >= 5) {
          setGameOver(true)
        } else {
          resetBall()
        }
      }
    }

    // Reset ball to center
    const resetBall = () => {
      ball.x = canvas.width / 2
      ball.y = canvas.height / 2
      ball.dx = -ball.dx
      ball.dy = Math.random() * 10 - 5 // Random vertical direction
    }

    // Change background color
    const updateBackgroundColor = () => {
      colorChangeTimer++
      if (colorChangeTimer > 60) {
        // Change color every 60 frames (about 1 second)
        colorChangeTimer = 0
        currentColorIndex = (currentColorIndex + 1) % colors.length
      }
    }

    // Draw everything
    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw middle field with changing color
      ctx.fillStyle = colors[currentColorIndex]
      ctx.fillRect(canvas.width / 2 - 2, 0, 4, canvas.height)

      // Draw paddles
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(player1.x, player1.y, player1.width, player1.height)
      ctx.fillRect(player2.x, player2.y, player2.width, player2.height)

      // Draw ball
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.size / 2, 0, Math.PI * 2)
      ctx.fillStyle = "#FFFFFF"
      ctx.fill()
      ctx.closePath()

      // Draw center line
      ctx.setLineDash([10, 15])
      ctx.beginPath()
      ctx.moveTo(canvas.width / 2, 0)
      ctx.lineTo(canvas.width / 2, canvas.height)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
      ctx.stroke()
      ctx.closePath()
      ctx.setLineDash([])
    }

    // Game loop
    let animationId: number
    const gameLoop = () => {
      if (gameOver) {
        return
      }
      updatePaddles()
      updateBall()
      updateBackgroundColor()
      draw()
      animationId = requestAnimationFrame(gameLoop)
    }

    // Start the game loop
    gameLoop()

    // Cleanup
    return () => {
      window.removeEventListener("keydown", keyDownHandler)
      window.removeEventListener("keyup", keyUpHandler)
      cancelAnimationFrame(animationId)
    }
  }, [gameStarted, gameOver, showNameForm, showModeSelection, gameMode, isMobile])

  if (showModeSelection) {
    return (
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Escolha o Modo de Jogo</h2>
        <div className="space-y-4">
          <Button
            onClick={() => handleModeSelection("single")}
            className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700"
          >
            Jogar Sozinho
          </Button>

          {!isMobile ? (
            <Button
              onClick={() => handleModeSelection("multi")}
              className="w-full py-6 text-lg bg-green-600 hover:bg-green-700"
            >
              Jogar com Outra Pessoa
            </Button>
          ) : (
            <Button
              disabled
              className="w-full py-6 text-lg bg-gray-600 cursor-not-allowed"
              title="Modo multiplayer não disponível em dispositivos móveis"
            >
              (Indisponível em Mobile)
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (showNameForm) {
    return (
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {gameMode === "single" ? "Digite seu nome" : "Escolham seus nomes"}
        </h2>
        <form onSubmit={handleStartGame} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="player1" className="text-white">
              {gameMode === "single" ? "Seu Nome" : "Jogador 1 (Teclas W/S)"}
            </Label>
            <Input
              id="player1"
              value={tempPlayer1Name}
              onChange={(e) => setTempPlayer1Name(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder={gameMode === "single" ? "Digite seu nome" : "Digite o nome do Jogador 1"}
            />
          </div>

          {gameMode === "multi" && (
            <div className="space-y-2">
              <Label htmlFor="player2" className="text-white">
                Jogador 2 (Setas)
              </Label>
              <Input
                id="player2"
                value={tempPlayer2Name}
                onChange={(e) => setTempPlayer2Name(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Digite o nome do Jogador 2"
              />
            </div>
          )}

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
            Começar Jogo
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[800px] mb-4">
        <div className="text-xl md:text-2xl font-bold text-white">
          {player1Name}: {player1Score}
        </div>
        <div className="text-xl md:text-2xl font-bold text-white">
          {player2Name}: {player2Score}
        </div>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border border-white bg-black rounded-lg shadow-lg"
          style={{ maxWidth: "100%" }}
        />
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-xl md:text-2xl font-bold text-center px-4">
            {gameMode === "single"
              ? "Pressione as setas para começar"
              : "Pressione qualquer tecla de controle para começar"}
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg">
            <div className="text-2xl md:text-3xl font-bold text-white mb-4 text-center px-4">
              {player1Score >= 5 ? `${player1Name} Venceu!` : `${player2Name} Venceu!`}
            </div>
            <button
              onClick={restartGame}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
            >
              Reiniciar Jogo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
