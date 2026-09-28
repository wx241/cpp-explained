# Conditional Compilation 

## `if constexpr` and `#if`

C++'s `if constexpr` is not directly intended to replace conditional defines (e.g., `#ifdef` or `#if`). While they serve somewhat similar purposes, they have different use cases and operate at different stages of the compilation process.

`#ifdef` and `#if` are preprocessor directives in C++ that allow conditional compilation. They operate at the preprocessing stage, which occurs before the actual compilation. Conditional defines are typically used to conditionally include or exclude sections of code based on compile-time conditions or macros.

On the other hand, `if constexpr` is a feature introduced in C++17 that allows compile-time evaluation of conditions within the context of template metaprogramming or constexpr functions. It is part of the regular C++ code and is evaluated during the compilation process, not the preprocessing stage. `if constexpr` allows you to conditionally choose between different branches of code based on compile-time constant expressions.

Here's an example to illustrate the difference:

```cpp
#include <iostream>

#define USE_FEATURE

void doSomething() {
#ifdef USE_FEATURE
    std::cout << "Feature is enabled." << std::endl;
#else
    std::cout << "Feature is disabled." << std::endl;
#endif
}

template <bool UseFeature>
void doSomethingTemplate() {
    if constexpr (UseFeature) {
        std::cout << "Feature is enabled." << std::endl;
    } else {
        std::cout << "Feature is disabled." << std::endl;
    }
}

int main() {
    doSomething();  // Output depends on the USE_FEATURE macro.

    doSomethingTemplate<true>();  // Output depends on the template argument.
    doSomethingTemplate<false>();

    return 0;
}
```

In this example, `doSomething()` uses a conditional define to determine which section of code to compile based on the `USE_FEATURE` macro. On the other hand, `doSomethingTemplate()` is a function template that utilizes `if constexpr` to conditionally choose between different code branches at compile time based on the template argument.

While `if constexpr` can sometimes be used to achieve similar conditional behavior as conditional defines, their usage and capabilities are different. Conditional defines are more flexible and can be controlled externally via macros or command-line options, while `if constexpr` operates within the confines of the C++ code and allows compile-time decision making based on template arguments or constexpr conditions.

## Short-circuit behavior

The condition of `if constexpr` must be a constant expression (contextually converted to `bool`). Within it, `&&` and `||` short-circuit as usual, but short-circuiting only skips *evaluation*; it does not skip *substitution*. Every operand must still be well-formed for the given template arguments.

In this example:

```cpp
#include <type_traits>

struct HasFlag { static constexpr bool enabled = true; };

template <typename T>
void foo(T value) {
    // Error for T = int: even though is_class_v<int> is false,
    // T::enabled is still substituted, and int::enabled is ill-formed.
    if constexpr (std::is_class_v<T> && T::enabled) {
        // Code specific to class types that opt in
        // ...
    } else {
        // Code for other cases
        // ...
    }
}
```

`foo(HasFlag{})` compiles, but `foo(42)` does not. Also note that a runtime value such as the parameter `value` can never appear in the condition, because the condition must be a constant expression. To make the example work for every `T`, nest the checks: `if constexpr (std::is_class_v<T>) { if constexpr (T::enabled) { ... } }`.

## Branch elimination

In an `if constexpr` statement, the condition is evaluated at compile-time. If the condition is determined to be `false` during compilation, the code inside the branch that is not taken (either `if` or `else`) is discarded by the compiler. The discarded branch is still *parsed*, so it must be syntactically valid. Inside a template, however, a discarded statement is not *instantiated*, so code that would be ill-formed for the current template arguments (such as calling a member the type does not have) is not an error. Outside a template, both branches are fully checked.

This compile-time evaluation and branch elimination make `if constexpr` useful for conditional compilation and optimizing code based on compile-time conditions.

By discarding the unused branch, the compiler avoids instantiating it and does not generate any corresponding object code. This can help improve the compile time and reduce the size of the resulting binary executable.

## Always provide `else` branch

It is generally a good practice to provide an `else` branch or alternative handling for all possible cases in an `if constexpr` statement to avoid potential runtime issues and ensure that all scenarios are properly handled.

```cpp
#include <cmath>
#include <type_traits>

// Before C++23, static_assert(false) in a discarded branch is ill-formed,
// so the condition is made dependent on T.
template<class>
inline constexpr bool always_false = false;

template<class T>
auto subtract(T a, T b) {
    if constexpr (std::is_same<T, double>::value) {
        if (std::abs(a - b) < 0.0001) {
            return 0.0;
        } else {
            return a - b;
        }
    } else if constexpr (std::is_integral<T>::value) {
        return a - b;
    } else {
        static_assert(always_false<T>, "Non-handled type for subtract function");
    }
}
```

In this code, both double and integral types are explicitly handled. If a type is used that is neither double nor an integral type, the static_assert will trigger a compile-time error with a clear message (since C++23, [P2593](https://wg21.link/P2593), a plain `static_assert(false, ...)` works here too), which is generally preferable to a more obscure error about invalid operations. This is a more defensive programming strategy that makes sure all potential types are handled.


