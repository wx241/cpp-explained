# Default Initialization for Non-Static Data Members

## Default Member Initializers

Before C++11, non-static data members had to be initialized using constructor initializer lists. This often led to repetitive and error-prone code, especially when dealing with many data members or overloaded constructors.

Here's an example that illustrates the issue:

```cpp
class Person {
public:
    Person() : age_(0), height_(170.0), name_("John Doe") 
    {}

    Person(int age) : age_(age), height_(170.0), name_("John Doe")
    {}

    Person(double height) : age_(0), height_(height), name_("John Doe") 
    {}

    Person(const std::string& name) : age_(0), height_(170.0), name_(name) 
    {}

private:
    int age_;
    double height_;
    std::string name_;
};
```

This class `Person` has multiple constructors that all repeat default values for members not being set. Maintaining such duplication across constructors is tedious and invites bugs when defaults need to be updated.

C++11 allows us to move those default values to the member declarations themselves using either `=` or `{}` syntax:

```cpp
class Person {
public:
    Person() 
    {}

    Person(int age) : age_(age) 
    {}

    Person(double height) : height_(height)
    {}

    Person(const std::string& name) : name_(name) 
    {}

private:
    int age_ = 0;
    double height_{170.0};
    std::string name_{"John Doe"};
};
```

This version is cleaner. Each constructor focuses only on what it needs to initialize, and the rest rely on the defaults declared with the member.

For example, the constructor `Person(double height)` just sets `height_`; both `age_` and `name_` are initialized using their declared defaults.

### Initialization Precedence

If a member is initialized in both the declaration and a constructor initializer list, the **constructor's initializer list takes precedence**. That means the default is only used when the constructor doesn't override it.

### Common Mistakes to Avoid

#### 1. **Do not use parentheses `()` for default member initialization**

This will cause a compiler error:

```cpp
struct Invalid {
    int x(42);  // ❌ Error: Invalid syntax
};
```

Instead, use `=` or `{}`:

```cpp
struct Valid {
    int x = 42;     // ✅ OK
    int y{100};     // ✅ OK
};
```

#### 2. **Do not use `auto` in member declarations**

Although `auto` is fine for local variables, it is not allowed for member declarations with default initialization:

```cpp
struct Bad {
    auto n = 5;  //  Error: `auto` not allowed in this context
};
```

You must explicitly specify the type:

```cpp
struct Good {
    int n = 5;  // ✅ OK
    int y {5};  // ✅ OK
};
```

However, for static inline data member, you can:
```cpp
struct Good {
    static inline auto n = 5; // ✅ OK  
};
```

## Default Initialization for Bitfields (C++20)

In C++, bitfields allow you to define struct members that occupy a specified number of bits, enabling compact storage of small data like flags or codes. For example:

```cpp
struct Status {
    unsigned int ready : 1;
    unsigned int error : 1;
    unsigned int mode  : 2;
};
```
Here, the three fields share just 4 bits of a single `unsigned int` instead of occupying 3 full ints (`sizeof(Status)` is still typically 4 bytes, because the storage unit is an `unsigned int`), making it memory-efficient—ideal for embedded systems or hardware register mappings. Bitfields improve clarity when working with individual bits, avoiding manual bitmasks. However, they come with drawbacks: layout and alignment are implementation-defined, so bitfields are not portable across compilers; you can't take the address of bitfield members; and access may be slower due to extra masking logic. 

Bitfields are powerful for space-constrained or hardware-close applications, but should be avoided when portability or precise control is required.


C++20 expands this feature to allow default initializers for **bitfields** as well:

```cpp
struct Flags {
    /*
    is_valid is a 1-bit-wide field. It can store either 0 or 1 (only two possible values).
    = 1 is the default member initializer, which means:
    If you create an instance of Flags without explicitly setting is_valid, it will default to 1.
    In practice, this could serve as a default "enabled" or "valid" flag.
    */
    unsigned int is_valid : 1 = 1;

    /* 
    error_code is a 3-bit-wide field.  It can represent integer values from 0 to 7 (since 3 bits → 2³ = 8 possibilities).
    {4} is brace-style default initialization. For ordinary data members it has been valid
    since C++11, but for bitfields both the = and {} forms are only allowed since C++20.
    So, if you don’t explicitly assign error_code, it defaults to 4.
    This might represent a default error type or status code in a compact system.
    */
    unsigned int error_code : 3 {4};
};
```

Here, `is_valid` is a 1-bit field default-initialized to `1`, and `error_code` is a 3-bit field default-initialized to `4`.

Bitfield initialization is simple, but you must be careful with expressions that include conditionals or operators, which can confuse the compiler’s parsing rules.

Consider this broken example:

```cpp
int config;
struct Settings {
    int level : true ? 4 : config = 3;
    int mode : 1 || new int{1};
};
```

This won’t default-initialize `level` or `mode` because the parser assumes `= 3` and `{1}` are part of the bitfield width expressions.

To fix this, use parentheses to clarify parsing:

```cpp
int config;
struct Settings {
    int level : (true ? 4 : config) = 3; // Bitfield widths must be const expressions. But config here is not evaluated.
    int mode : (1 || new int){1}; // new int is not evaluated.
};
```

Now `level` will default to `3`, and `mode` will default to `1`.

## Summary

Default member initializers introduced in C++11 and enhanced in C++20 help make class definitions cleaner and more robust:

- They reduce redundancy in constructors.
- Constructors can focus only on members they care about.
- Code becomes easier to read and maintain.
- Bitfields can now also benefit from default values in C++20.