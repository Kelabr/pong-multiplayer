"use client"

import { useState, useEffect } from "react"

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Função para verificar se é um dispositivo móvel
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    // Verificar inicialmente
    checkMobile()

    // Adicionar listener para redimensionamento da janela
    window.addEventListener("resize", checkMobile)

    // Limpar listener
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}
