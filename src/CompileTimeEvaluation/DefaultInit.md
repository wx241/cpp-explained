# Default Initialization of `constexpr` Objects

In C++20 ([P1331](https://wg21.link/P1331)), the language standard introduced the ability to use trivial default initialization for local variables inside constexpr functions. Trivial default initialization means that such a variable can be declared without an initializer, leaving its value indeterminate until it is assigned. Reading it before assigning is still not allowed in a constant expression, and a `constexpr` *variable* itself must still be initialized.

Here is an example that demonstrates the usage of trivial default construction in a constexpr function:

```cpp
struct X {
    bool val;
};

constexpr void f() {
    X x;
}
```

The above code only works with C++20. C++17 requires that every variable in a constexpr function be explicitly initialized. Here is an example of explicitly initializing such a variable in C++17:

```cpp
struct X {
    bool val;
};

constexpr void f() {
    X x{true}; // Explicit initialization required in C++17
}
```

The following example demonstrates the usage of trivial default construction in a more practical scenario:

```cpp
#include <array>

constexpr std::array<int, 5> createArray() {
    std::array<int, 5> arr;
    for (std::size_t i = 0; i < arr.size(); ++i) {
        arr[i] = i * i;
    }
    return arr;
}

int main() {
    constexpr std::array<int, 5> result = createArray();
    // Use the constexpr array at compile time
    static_assert(result[2] == 4, "Unexpected value at compile time!");
    return 0;
}
```

In this example, the constexpr function `createArray` creates an array of integers and assigns values to its elements using a loop. The array `arr` is default-initialized without explicitly providing an initializer because `std::array<int, 5>` is trivially default constructible, and every element is assigned before it is read. The function returns the resulting array, which can then be used at compile time.

By allowing trivial default initialization in constexpr functions, C++20 simplifies the initialization process for certain types and enables more concise and efficient constexpr code. It can be particularly beneficial when working with trivial types or when initializing objects that don't require explicit initialization before use.