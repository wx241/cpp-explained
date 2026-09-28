# std::numeric_limits

`std::numeric_limits` is a class template defined in the C++ standard library that provides information about the properties of arithmetic types, such as minimum and maximum representable values, number of significant digits, and whether the type is signed or unsigned.

The `std::numeric_limits` class template has the following general syntax:

```cpp
template<typename T>
class numeric_limits {  // primary template (abridged)
public:
    static constexpr bool is_specialized = false;
    static constexpr T min() noexcept;
    static constexpr T max() noexcept;
    static constexpr T lowest() noexcept;
    static constexpr int digits = 0;
    static constexpr int digits10 = 0;
    static constexpr int max_digits10 = 0;
    static constexpr bool is_signed = false;
    static constexpr bool is_integer = false;
    static constexpr bool is_exact = false;
    static constexpr int radix = 0;
    static constexpr T epsilon() noexcept;
    static constexpr T round_error() noexcept;
    static constexpr int min_exponent = 0;
    static constexpr int min_exponent10 = 0;
    static constexpr int max_exponent = 0;
    static constexpr int max_exponent10 = 0;
    static constexpr bool has_infinity = false;
    static constexpr bool has_quiet_NaN = false;
    static constexpr bool has_signaling_NaN = false;
    static constexpr float_denorm_style has_denorm = denorm_absent;  // deprecated in C++23
    static constexpr bool has_denorm_loss = false;              // deprecated in C++23
    static constexpr T infinity() noexcept;
    static constexpr T quiet_NaN() noexcept;
    static constexpr T signaling_NaN() noexcept;
    static constexpr T denorm_min() noexcept;
};
```

The `std::numeric_limits` class template provides a set of static member functions and constants that can be used to query the properties of the template parameter type `T`. These functions and constants are all `constexpr`, which means that they can be evaluated at compile-time and used in constant expressions.

The `constexpr` specifier is useful for several reasons in the context of `std::numeric_limits`. For one, it allows the properties of a type to be determined at compile-time, which can be useful for optimization purposes. Additionally, it enables the use of these properties in other `constexpr` contexts, such as defining other `constexpr` functions or variables. This can help improve the efficiency and readability of code. For example:

```cpp
#include <iostream>
#include <limits>

template<typename T>
constexpr bool is_power_of_two(T value) {
    return value != 0 && (value & (value - 1)) == 0;
}

template<typename T>
constexpr T next_power_of_two(T value) {
    static_assert(std::numeric_limits<T>::is_integer, "Type must be an integer");
    static_assert(std::numeric_limits<T>::is_signed == false, "Type must be unsigned");

    if (is_power_of_two(value)) {
        return value;
    } else {
        T result = 1;
        while (result < value) {
            result <<= 1;
        }
        return result;
    }
}

int main() {
    constexpr unsigned int x = 31;
    constexpr auto y = next_power_of_two(x);
    std::cout << "The next power of two after " << x << " is " << y << '\n';
    return 0;
}
```
