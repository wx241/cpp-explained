# `constexpr` virtual method

In C++20 ([P1064](https://wg21.link/P1064)), virtual methods can be declared as `constexpr`. The point of this feature is that **virtual dispatch now works during constant evaluation**: when a virtual function is called on an object created during the constant evaluation, the compiler selects the final overrider, just as it would at runtime, and evaluates it at compile time.

A `constexpr` function can override a non-`constexpr` one and vice versa. Consider an example where the base class has a non-`constexpr` virtual method, but the derived class overrides it as `constexpr`:

```cpp
class Base {
public:
    virtual int getValue() const { return 42; }
};

class Derived : public Base {
public:
    constexpr int getValue() const override { return 10; }
};
```

Here's an example of virtual dispatch evaluated at compile time:

```cpp
struct Shape {
    constexpr virtual ~Shape() = default;
    constexpr virtual int sides() const = 0;
};

struct Triangle : Shape {
    constexpr int sides() const override { return 3; }
};

struct Square : Shape {
    constexpr int sides() const override { return 4; }
};

constexpr int countSides(const Shape& s) {
    return s.sides();            // virtual call
}

constexpr int total() {
    Triangle t;
    Square sq;
    return countSides(t) + countSides(sq);
}

static_assert(total() == 7);     // dispatch resolved at compile time
```

Before C++20, `countSides` could not be `constexpr` at all, because a virtual function could not be `constexpr`.

> Note - this is different from *devirtualization*. When the static type of an object is known, for example `Derived der; int value = der.getValue();`, an optimizing compiler may inline the call into a direct assignment (`mov DWORD PTR [ebp-4], 10`). That optimization does not need, and does not come from, `constexpr`; the compiler does it for non-`constexpr` virtual functions too. The specific optimization and resulting assembly code vary with the compiler and flags.
