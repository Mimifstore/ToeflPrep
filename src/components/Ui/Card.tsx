import * as React from "react";
import clsx from "clsx";

    export function Card({
    children,
    className,
    }: {
    children: React.ReactNode;
    className?: string;
    }) {
    return (
        <div
        className={clsx(
            "rounded-lg border border-gray-200 bg-white shadow-sm",
            className
        )}
        >
        {children}
        </div>
    );
    }

    export function CardHeader({
    children,
    className,
    }: {
    children: React.ReactNode;
    className?: string;
    }) {
    return <div className={clsx("p-4 border-b", className)}>{children}</div>;
    }

    export function CardTitle({
    children,
    className,
    }: {
    children: React.ReactNode;
    className?: string;
    }) {
    return (
        <h3 className={clsx("text-base font-semibold text-gray-800", className)}>
        {children}
        </h3>
    );
    }

    export function CardContent({
    children,
    className,
    }: {
    children: React.ReactNode;
    className?: string;
    }) {
    return <div className={clsx("p-4", className)}>{children}</div>;
    }

    export function CardFooter({
    children,
    className,
    }: {
    children: React.ReactNode;
    className?: string;
    }) {
    return <div className={clsx("p-4 border-t", className)}>{children}</div>;
    }
