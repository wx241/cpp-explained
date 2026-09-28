# Other C++20 Enhancements

In C++20, several enhancements were made to the `constexpr` feature, including the ability to change the active member of a union and the inclusion of certain language constructs like `dynamic_cast`, `typeid`, and inlined assembly within `constexpr` functions.

## Changing the active member of a union in constexpr
In earlier versions of C++, changing the active member of a union within a `constexpr` context was not allowed. However, starting from C++20 ([P1330](https://wg21.link/P1330)), it became possible: you can assign to a different member, which ends the lifetime of the old member and makes the new one active. Reading a member that is *not* active is still undefined behavior, and therefore never allowed in a constant expression (so union "type punning" does not work at compile time). Here's an example that demonstrates this:

```cpp
#include <iostream>

union MyUnion {
    int i;
    float f;
};

constexpr float modifyUnionMember(int value) {
    MyUnion u{};
    u.i = value;          // i is the active member
    u.f = value * 0.5f;   // OK since C++20: f becomes the active member
    return u.f;           // reading the active member is fine
    // return u.i;        // error: reading an inactive member is UB
}

int main() {
    constexpr float modifiedValue = modifyUnionMember(42);
    std::cout << "Modified value: " << modifiedValue << std::endl;
    return 0;
}
```

## `dynamic_cast` and `typeid` within `constexpr`
C++20 ([P1327](https://wg21.link/P1327)) also introduced the ability to use `dynamic_cast` and polymorphic `typeid` within `constexpr` functions. This allows for dynamic type checks and type information retrieval during compile-time evaluation. The objects involved must be created during the constant evaluation (for example as local variables), and the class needs a `constexpr` destructor. Here's an example:

```cpp
#include <iostream>
#include <typeinfo>

struct Base {
    constexpr virtual ~Base() = default;
};

struct Derived : Base {};

constexpr bool isDerived(const Base& obj) {
    return dynamic_cast<const Derived*>(&obj) != nullptr;
}

constexpr bool checkTypes() {
    Derived d;
    Base b;
    return isDerived(d) && !isDerived(b);
}

constexpr const std::type_info& getTypeInfo(const Base& obj) {
    return typeid(obj);   // polymorphic typeid, allowed in constexpr since C++20
}

int main() {
    static_assert(checkTypes());   // dynamic_cast evaluated at compile time

    Derived d;
    const Base& ref = d;
    std::cout << "Is Derived? " << isDerived(ref) << std::endl;
    std::cout << "Type info: " << getTypeInfo(ref).name() << std::endl;
    return 0;
}
```

Note that `std::type_info::name()` is not `constexpr`, and `std::type_info::operator==` is only `constexpr` since C++23.

## Inlined assembly within `constexpr`
C++20 ([P1668](https://wg21.link/P1668)) also allows an inline assembly (`asm`) declaration to appear inside a `constexpr` function, as long as it is **not evaluated** during constant evaluation. Combined with `std::is_constant_evaluated()`, one function can use portable C++ at compile time and hand-written assembly at runtime. Here's an example (GCC/Clang, x86):

```cpp
#include <iostream>
#include <type_traits>

constexpr int addNumbers(int a, int b) {
    if (std::is_constant_evaluated()) {
        return a + b;                       // compile-time path
    } else {
        int result = a;
        asm("addl %[b], %[result]"          // runtime path: result += b
            : [result] "+r" (result)
            : [b] "r" (b));
        return result;
    }
}

int main() {
    constexpr int sum = addNumbers(10, 20); // uses the compile-time path
    int x = 1, y = 2;
    std::cout << "Sum: " << sum << ", " << addNumbers(x, y) << std::endl;
    return 0;
}
```
