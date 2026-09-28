# `constexpr`

`constexpr` is a C++ keyword that was introduced in C++11 to allow the evaluation of expressions at compile time. It specifies that the value of a `variable` or `function` can be computed at compile time, and therefore can be used in places where a constant expression is required.

## `constexpr` vs. `const`
`const` only guarantees that the value of a variable cannot be changed after it is initialized, whereas `constexpr` *guarantees* that the value of a variable can be computed at *compile time*. Therefore, `constexpr` is more powerful than `const` because it enables the use of constant expressions in more contexts.

Here are some examples of how `constexpr` can be used:

```cpp
constexpr int square(int x) {
    return x * x;
}

constexpr int x = 5;

// y is computed at compile time
constexpr int y = square(x); 

// z is also initialized at compile time (constant initialization),
// because square(6) is a constant expression. Unlike constexpr,
// however, const does not *require* it: const int w = f(); with a
// non-constexpr f() is allowed and initializes w at run time.
const int z = square(6); 

constexpr int arr_size = 10;

// arr_size is a constant expression
int arr[arr_size]; 

constexpr char c = 'A' + 1;

// static_assert is a compile-time assertion
static_assert(c == 'B', "c should be equal to 'B'"); 
```

## `constexpr` function

To make a function `constexpr`, it must meet the following conditions:

1. **Must have a literal return type.**

```cpp
// Returns a literal type, like int here
constexpr int square(int x) { 
    return x * x;
}
```

In C++11, a `constexpr` function could not have a return type of `void`. Since C++14, `void` is allowed (see [`constexpr` function returning `void`](#constexpr-function-returning-void) below).

2. **Must be defined with `constexpr` keyword.**

```cpp
// Use the 'constexpr' keyword before the function definition
constexpr int factorial(int n) { 
    return (n <= 1) ? 1 : n * factorial(n - 1);
}
```

3. **Local variables must be of literal type** (and, until C++20, must be initialized). In C++11 the body of a `constexpr` function could contain essentially only a single `return` statement, so no local variables were allowed at all. Since C++14, any local variable of literal type is allowed, `const` or not, and its initializer does not have to be a constant expression. It must not be `static` or `thread_local` (until C++23).

```cpp
// C++11 style: a single return statement
constexpr int sum(int a, int b) {
    return a + b;
}

// Since C++14: ordinary (non-const) local variables are fine
constexpr int add(int a, int b) {
    int sum = a + b; 
    sum *= 2;
    return sum;
}
```

4. **May include control structures and constructs** (since C++14), such as `if`, `switch`, `for`, `while`, and `do-while` loops, provided they don't violate other `constexpr` constraints. `static_assert`, `typedef`, `using`, `if constexpr`, and `return`are also allowed.


```cpp
#include <iostream>

constexpr int factorial(int n) {
    int result = 1;
    for (int i = 1; i <= n; ++i) {
        result *= i;
    }
    return result;
}

int main() {
    constexpr auto a = factorial(5);
    return 0;
}
```

The generated assembly code confirms that variable `a` is evaluated at the compile time:

```asm
main:                                 
        push    rbp
        mov     rbp, rsp
        mov     dword ptr [rbp - 4], 0
        mov     dword ptr [rbp - 8], 120
        xor     eax, eax
        pop     rbp
        ret
```

5. **Can only call other `constexpr` functions.**

```cpp
constexpr int square(int x) {
    return x * x;
}

// Only call other constexpr functions
constexpr int square_sum(int a, int b) {
    return square(a) + square(b); 
}
```

6. **Must produce constant expressions when called with constant expressions.**

```cpp
#include <iostream>

constexpr int power(int base, int exponent) {
    int result = 1;
    for (int i = 0; i < exponent; ++i) {
        result *= base;
    }
    return result;
}

int main() {
    constexpr auto b = power(2, 5);
    return 0;
}
```

The following assembly code confirms that no run time computation is performed when calculating `power(2, 5)`.

```asm
main:
        push    rbp
        mov     rbp, rsp
        mov     dword ptr [rbp - 4], 0
        mov     dword ptr [rbp - 8], 32
        xor     eax, eax
        pop     rbp
        ret
```

7. **Since C++14, may modify objects whose lifetime began within the evaluation** (for example parameters and local variables). It cannot modify a global object that exists outside the constant evaluation.

```cpp
constexpr int next(int x)
{
    return ++x;
}

char buffer[next(5)] = { 0 };
```

## Constructor

`constexpr` constructors in C++ are used to create constant expressions of user-defined types during compile-time. They are useful because they allow for more efficient code by performing computations at compile-time and enabling the usage of user-defined types in other `constexpr` contexts.

`constexpr` constructors were introduced in C++11, along with the general `constexpr` specifier.

Conditions (or constraints) for `constexpr` constructors:

1. The class must not have any virtual base classes. (Copy and move constructors *can* be `constexpr`; a defaulted one is implicitly `constexpr` when it meets the requirements.)
2. Every expression and construct used in the constructor must be a constant expression.
3. Every base class and member of the class must have a `constexpr` constructor.
4. Every constructor call and full-expression in the constructor's member initializers must be a constant expression.

Here's an example of a `constexpr` constructor:

```cpp
class Point {
public:
    constexpr Point(int x, int y) : x_(x), y_(y) {
        // Since C++14, the body of a constexpr constructor can include
        // other constructs like if statements and loops, as long as they
        // meet the constexpr requirements.
        if (x_ < 0) { x_ = 0; }
        if (y_ < 0) { y_ = 0; }
    }

    constexpr int getX() const { return x_; }
    constexpr int getY() const { return y_; }

private:
    int x_;
    int y_;
};

int main() {
    constexpr Point p1(1, 2);
    constexpr int x = p1.getX();
    constexpr int y = p1.getY();
}
```

### *Member initializer*
When defining a `constexpr` constructor,  the constructor's member initializer list must only contain constant expressions. This means that when initializing member variables or calling base class constructors, the expressions used must be evaluable compile-time. This is required to *guarantee* that the object can be constructed as a constant expression during compile-time.

Here's an example to illustrate this requirement:

```cpp
class Base {
public:
    constexpr Base(int value) : value_(value) {}

private:
    int value_;
};

class Derived : public Base {
public:
    // Both initializers are constant expressions
    constexpr Derived(int baseValue, int derivedValue) 
        : Base(baseValue), derivedValue_(derivedValue) {} // Both initializers are constant expressions

private:
    int derivedValue_;
};

int main() {
    // Constructed as a constant expression during compile-time
    constexpr Derived d(1, 2); 
}
```

## Destructor

If a class has a `constexpr` constructor and is meant to be used in a `constexpr` context, then until C++20 the destructor must be trivial. A trivial destructor does not perform any custom actions, allowing the object to be safely used in a `constexpr` context. Since C++20 ([P0784](https://wg21.link/P0784)), a destructor can also be declared `constexpr` and do non-trivial work, which is what makes `constexpr` `std::vector` and `std::string` possible.

> A destructor is considered trivial if:
> 1. It is not user-provided (i.e., the compiler generates the destructor implicitly).
> 2. The destructor is not virtual.
> 3. All direct base classes have trivial destructors.
> 4. For all non-static data members of the class that are of class type (or array thereof), each such class has a trivial destructor.

Here's an example of a class with a `constexpr` constructor and a trivial destructor:

```cpp
class Point {
public:
    constexpr Point(int x, int y) : x_(x), y_(y) {}

    // Destructor is trivial (not user-provided and no custom actions)
    // ~Point() = default;

    constexpr int getX() const { return x_; }
    constexpr int getY() const { return y_; }

private:
    int x_;
    int y_;
};

int main() {
    constexpr Point p(1, 2);
}
```

## `constexpr` function returning `void`

Since C++14, a function (including a member function) can be declared `constexpr` and have a return type of `void`, for performing a sequence of actions at compile time. Because a `constexpr` object is `const`, such a non-const member function is called on an object *during* constant evaluation, typically inside another `constexpr` function. For example:

```cpp
class MyClass {
public:
    constexpr void doSomething() {
        myData = 42; // Modify a data member
    }

    constexpr int getMyData() const {
        return myData;
    }

private:
    int myData = 0; // An ordinary non-static data member
};

constexpr MyClass make() {
    MyClass m;
    m.doSomething(); // Evaluated at compile time when make() is
    return m;
}

int main() {
    constexpr MyClass obj = make();
    static_assert(obj.getMyData() == 42, "Unexpected value of myData");
}
```

Note that `constexpr void doSomething()` does not have to be qualified with `const` (since C++14, `constexpr` member functions are no longer implicitly `const`).

## Precision of floating-point `constexpr`

In C++11 and later, `constexpr` functions can compute floating-point expressions and return floating-point values as constant expressions.

> Library functions like `std::sin` and `std::sqrt` cannot be used inside a `constexpr` evaluation simply because they are not declared `constexpr` in the standard library (until C++26; see [Math functions](MathFunctions.md)). There is nothing inherently "infinite" about them: you can write your own `constexpr` square root with a loop.
> 
> An operation whose result is not mathematically defined or not representable (for example one that overflows or would raise a floating-point exception) is not a constant expression.

The C++ standard does **not** require that compile-time and run-time floating-point evaluation give identical results. [expr.const] explicitly says it is unspecified whether a floating-point expression evaluated at translation time yields the same value as the same expression evaluated during program execution (for example, the compiler may use a different precision or ignore the run-time rounding mode).

In practice, the precision of `constexpr` floating point computations will depend on the compiler and the platform being used. In general, compilers will try to produce `constexpr` results that are as precise as possible, but there may be cases where the precision is lower than the runtime counterpart due to limitations of the compiler or platform.