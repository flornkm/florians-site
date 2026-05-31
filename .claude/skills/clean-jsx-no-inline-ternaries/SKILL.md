---
name: clean-jsx-no-inline-ternaries
description: Keep JSX and component logic clean by minimizing inline ternaries, nested conditionals, and stringified conditional classes. Hoist branching out of the render tree. Use whenever writing or editing a React component, especially when class strings, JSX, or props start branching.
---

# Clean JSX — no inline ternary soup

Inline ternaries and nested conditionals inside JSX are the fastest way to make a component unreadable. Push branching **out** of the render tree so the JSX shows shape, not logic.

## The rules

1. **Zero ternaries inside `className` strings.** Use `cn(...)` with boolean expressions instead.
   ```tsx
   // bad
   <div className={`rounded-md ${isActive ? "bg-muted text-foreground" : "bg-background text-muted-foreground"}`} />

   // good
   <div
     className={cn(
       "rounded-md",
       isActive ? "bg-muted text-foreground" : "bg-background text-muted-foreground",
     )}
   />

   // even better when only one branch adds classes
   <div className={cn("rounded-md bg-background text-muted-foreground", isActive && "bg-muted text-foreground")} />
   ```

2. **At most one ternary per JSX expression.** No nested `a ? b : c ? d : e` in markup. If you need two branches, hoist to a variable or early return:
   ```tsx
   // bad
   {status === "loading" ? <Spinner /> : status === "error" ? <ErrorState /> : <List items={data} />}

   // good — hoisted
   const body =
     status === "loading" ? <Spinner /> :
     status === "error"   ? <ErrorState /> :
     <List items={data} />

   return <section>{body}</section>
   ```
   Better still: split into separate components and pick one.

3. **Use `&&` for "render or nothing", not ternaries with `null`.**
   ```tsx
   // bad
   {hasBadge ? <Badge /> : null}

   // good
   {hasBadge && <Badge />}
   ```
   Beware the `0` pitfall — guard numeric values explicitly: `{count > 0 && <Badge count={count} />}`.

4. **No ternaries that produce props.** Compute the value above the return.
   ```tsx
   // bad
   <Button variant={isPrimary ? "default" : "outline"} size={isLarge ? "lg" : isSmall ? "sm" : "default"} />

   // good
   const variant = isPrimary ? "default" : "outline"
   const size = isLarge ? "lg" : isSmall ? "sm" : "default"
   return <Button variant={variant} size={size} />
   ```

5. **Lift complex conditionals into named helpers or `cva`.** If a component's class string branches on three or more booleans, that is a variant system — use `class-variance-authority` like `button.tsx` does. Do not chain ternaries.

6. **Prefer lookup tables to ternary chains** when branching on a discrete value:
   ```tsx
   // bad
   const label = kind === "info" ? "Info" : kind === "warn" ? "Warning" : kind === "error" ? "Error" : "Unknown"

   // good
   const labels = { info: "Info", warn: "Warning", error: "Error" } as const
   const label = labels[kind] ?? "Unknown"
   ```

7. **Early returns over wrapping ternaries** at the top of a component.
   ```tsx
   // bad
   return isLoading ? <Spinner /> : <Real />

   // good
   if (isLoading) return <Spinner />
   return <Real />
   ```

## When a ternary is fine

- A single, short ternary that picks between two literal values (string, number, JSX element) and reads in one line.
- The `cn("base", cond ? "a" : "b")` pattern inside a single `cn` call — that is the idiomatic form, not nested.

## Review checklist before saving

Scan the JSX you wrote and ask:

1. Are there template literals with `${... ? ... : ...}` inside a `className`? → move into `cn(...)`.
2. Is any ternary nested inside another ternary? → hoist into a `const` or early return.
3. Is a ternary returning `null`? → switch to `&&`.
4. Are there 3+ booleans driving a class string? → use `cva`.
5. Could a `const` declared 3 lines above remove all branching from the return? → declare it.

If the JSX reads like markup with small inserts rather than a logic puzzle, it is done.
