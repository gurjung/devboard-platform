import React from "react"
import { render, screen } from "@testing-library/react"
import { Button } from "../button"

describe("Button component", () => {
  it("renders correctly with default styles and text", () => {
    render(<Button>Click me</Button>)
    const buttonElement = screen.getByRole("button", { name: /click me/i })
    expect(buttonElement).toBeInTheDocument()
    expect(buttonElement).toHaveClass("bg-primary")
  })

  it("applies the specified variant and size classes", () => {
    render(<Button variant="destructive" size="sm">Delete</Button>)
    const buttonElement = screen.getByRole("button", { name: /delete/i })
    expect(buttonElement).toBeInTheDocument()
    expect(buttonElement).toHaveClass("bg-destructive")
    expect(buttonElement).toHaveClass("h-7")
  })
})
