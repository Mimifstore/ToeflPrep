"use client";

import React from "react";

export default function Button({
    children,
    variant = "primary",
    className = "",
    ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary"
    }) {
    const base = "px-4 py-2 rounded-xl font-medium transition duration-200";

    const variants = {
        primary: "bg-orange-500 text-white hover:bg-orange-600",
        secondary: "bg-white text-blue-700 hover:bg-gray-100",
    };

    return (
        <button
        {...props}
        className={`${base} ${variants[variant]} ${className}`}
        >
        {children}
        </button>
    );
}