# `constexpr` math functions (C++23 and C++26)

For a long time none of the `<cmath>` functions were `constexpr`. C++20 did **not** change that (it only added a few new `constexpr` numeric helpers such as `std::lerp` in `<cmath>` and `std::midpoint` in `<numeric>`). The standard library caught up in two steps:

- **C++23** ([P0533](https://wg21.link/P0533)) made the "simple" functions `constexpr`: absolute value, remainders, min/max, rounding toward a fixed direction, floating-point manipulation, and classification. The integer `abs` and `div` families in `<cstdlib>` became `constexpr` at the same time.
- **C++26** ([P1383](https://wg21.link/P1383)) extends this to most of the remaining functions: trigonometric, hyperbolic, exponential, logarithmic, power, `sqrt`, and so on.

The main advantage of using `constexpr` math functions is that they enable calculations at compile time rather than at runtime. This can lead to performance improvements because the compiler can optimize the code based on the known constant values. Additionally, because the values are known at compile time, they can be used in places where a constant expression is needed, such as in array sizes and template arguments.

Here are some important points to remember about `constexpr` math functions:

1. Only the functions listed below are `constexpr`, and only from the standard shown. Other functions may still be evaluated only at runtime.

2. The arguments provided to a `constexpr` function must be constant expressions themselves. Otherwise, the function call will not be evaluated at compile time.

3. A call that would raise a floating-point exception or set `errno` (for example a domain error) is not a constant expression, so it fails to compile in a constant-evaluated context.

4. The standard does not guarantee that a compile-time result is bit-for-bit identical to the runtime result for the same inputs.

5. Library support lags behind the standard. Be sure to check the documentation of the compiler and standard library being used. (GCC has long accepted many of its math builtins in constant expressions as an extension, which is non-portable.)

`std::min` and `std::max` are not `<cmath>` functions; they live in `<algorithm>` and have been `constexpr` since C++14.

Here's the table sorted by function name in ascending order:

| Function        | Description                                           | `constexpr` since |
|-----------------|-------------------------------------------------------|-------|
| `abs`, `fabs`     | Absolute value (`abs` for integers is in `<cstdlib>`) | C++23 |
| `acos`            | Arc cosine function                                   | C++26 |
| `acosh`           | Inverse hyperbolic cosine function                    | C++26 |
| `asin`            | Arc sine function                                     | C++26 |
| `asinh`           | Inverse hyperbolic sine function                      | C++26 |
| `atan`            | Arc tangent function                                  | C++26 |
| `atan2`           | Arc tangent function with two parameters              | C++26 |
| `atanh`           | Inverse hyperbolic tangent function                   | C++26 |
| `cbrt`            | Cube root                                             | C++26 |
| `ceil`            | Ceiling function                                      | C++23 |
| `copysign`        | Copy sign of a number                                 | C++23 |
| `cos`             | Cosine function                                       | C++26 |
| `cosh`            | Hyperbolic cosine function                            | C++26 |
| `div`             | Integral division (in `<cstdlib>`)                    | C++23 |
| `erf`             | Error function                                        | C++26 |
| `erfc`            | Complementary error function                          | C++26 |
| `exp`             | Exponential function                                  | C++26 |
| `exp2`            | Base-2 exponential function                           | C++26 |
| `expm1`           | Exponential function minus 1                          | C++26 |
| `fdim`            | Positive difference                                   | C++23 |
| `floor`           | Floor function                                        | C++23 |
| `fma`             | Fused multiply-add                                    | C++26 |
| `fmax`            | Maximum of two floating-point values                  | C++23 |
| `fmin`            | Minimum of two floating-point values                  | C++23 |
| `fmod`            | Floating-point remainder (modulo)                     | C++23 |
| `fpclassify`, `isfinite`, `isinf`, `isnan`, `isnormal`, `signbit` | Classification | C++23 |
| `frexp`           | Break floating-point number into fraction             | C++23 |
| `hypot`           | Hypotenuse                                            | C++26 |
| `ilogb`           | Integral logarithm of exponent base-2                 | C++23 |
| `ldexp`           | Multiply by integral power of 2                       | C++23 |
| `lerp`            | Linear interpolation                                  | C++20 |
| `lgamma`          | Natural logarithm of the absolute value of the gamma function | C++26 |
| `llround`         | Round to nearest long long integer                    | C++23 |
| `log`             | Natural logarithm                                     | C++26 |
| `log10`           | Base-10 logarithm                                     | C++26 |
| `log1p`           | Natural logarithm of 1 plus argument                  | C++26 |
| `log2`            | Base-2 logarithm                                      | C++26 |
| `logb`            | Base-2 logarithm of exponent                          | C++23 |
| `lround`          | Round to nearest long integer                         | C++23 |
| `modf`            | Decompose a floating-point number into its integer and fractional parts | C++23 |
| `nextafter`       | Next representable floating-point value               | C++23 |
| `nexttoward`      | Next representable floating-point value toward a long double | C++23 |
| `pow`             | Power function                                        | C++26 |
| `remainder`       | Remainder of the floating-point division              | C++23 |
| `remquo`          | Remainder and quotient of the floating-point division | C++23 |
| `round`           | Round to nearest integer                              | C++23 |
| `scalbln`         | Scale floating-point number by a power of FLT_RADIX as a long integer | C++23 |
| `scalbn`          | Scale floating-point number by a power of FLT_RADIX   | C++23 |
| `sin`             | Sine function                                         | C++26 |
| `sinh`            | Hyperbolic sine function                              | C++26 |
| `sqrt`            | Square root                                           | C++26 |
| `tan`             | Tangent function                                      | C++26 |
| `tanh`            | Hyperbolic tangent function                           | C++26 |
| `tgamma`          | Gamma function                                        | C++26 |
| `trunc`           | Truncate function                                     | C++23 |

Functions whose result depends on the current rounding mode (`rint`, `lrint`, `llrint`, `nearbyint`) and `nan` (which parses a string) were not part of the C++23 set. The C++17 special math functions (`std::cyl_bessel_j`, `std::riemann_zeta`, ...) are not `constexpr`. Functions such as `drem`, `gamma`, `gamma_r`, `scalb`, `significand`, `j0`/`j1`/`jn` and `y0`/`y1`/`yn` are POSIX/glibc extensions and are not part of standard C++ at all.
