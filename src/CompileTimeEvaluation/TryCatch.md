# try-catch 

In C++20 ([P1002](https://wg21.link/P1002)), the language standard introduced the ability to use try-catch blocks inside constexpr functions. Prior to C++20, a constexpr function could not contain a try-block at all, so any function that needed exception handling for its runtime use could not be `constexpr`.

With C++20, the restriction has been relaxed: a try-block is allowed inside a constexpr function. However, **throwing** is still not allowed during constant evaluation (until C++26, see below). A `throw` expression may appear in the function, but if constant evaluation actually reaches it, the call is simply not a constant expression and the compiler reports an error. As a result, a `catch` handler never runs at compile time.

The primary motivation behind allowing try-catch blocks in constexpr functions is to let one function serve both worlds: at compile time it runs the "happy path", and at runtime the same function can throw and handle exceptions normally. This removes the need to write a separate non-constexpr version just because the runtime code needs a `try`.

Here's an example that demonstrates the usage of try-catch blocks inside a constexpr function:

```cpp
#include <stdexcept>

constexpr int checked_divide(int a, int b) {
    try {
        if (b == 0)
            throw std::invalid_argument("division by zero");
        return a / b;
    } catch (const std::invalid_argument&) {
        return 0; // fallback value, only reachable at runtime
    }
}

int main(int argc, char**) {
    constexpr int result = checked_divide(10, 2);
    static_assert(result == 5, "Division failed at compile time!");

    // constexpr int bad = checked_divide(10, 0); // error: throw is not allowed
                                                  // during constant evaluation

    int r = checked_divide(10, argc - 1);         // runtime: may throw and catch
    return r;
}
```

In the above example, the compile-time call `checked_divide(10, 2)` never reaches the `throw`, so it is a valid constant expression. The call `checked_divide(10, 0)` in a constant-evaluated context would reach the `throw` and fail to compile. At runtime, the same function throws and catches as usual.

It's important to note a few caveats and considerations when using try-catch blocks in constexpr functions:

1. In C++20 and C++23, a `throw` cannot be evaluated at compile time. The try-block is allowed, but the catch handler is effectively runtime-only. C++26 ([P3068](https://wg21.link/P3068)) allows exceptions to be thrown and caught during constant evaluation, as long as they are caught before the evaluation ends.
2. Undefined behavior such as integer division by zero is not an exception. `a / 0` never throws; in a constant expression it is simply an error, and a `try` block does not change that.
3. Dynamic memory allocation with `new`/`delete` is allowed in constexpr functions since C++20 ([P0784](https://wg21.link/P0784)), provided every allocation is freed before the constant evaluation ends. `malloc` is still not allowed.

Overall, the addition of try-catch blocks in constexpr functions in C++20 lets more real-world functions be `constexpr` without splitting them into compile-time and runtime versions.
