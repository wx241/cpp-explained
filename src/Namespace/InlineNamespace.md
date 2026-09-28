# Inline Namespace

## What is `inline namespace`
When a namespace is declared as `inline`, it means that its members are automatically injected into the enclosing parent namespace, as if they were defined directly in the parent namespace. This allows clients of the namespace to refer to its members without needing to qualify them with the namespace name.

For example, consider the following code:

```cpp
namespace outer {
    inline namespace inner {
        void foo() {}
    }
}
```

Here, `inner` is an inline namespace that is declared within the `outer` namespace. This means that `foo()` can be accessed either as `outer::inner::foo()` or simply as `outer::foo()`.

## Use case

C++ `inline` namespaces were introduced in the C++11 standard to provide a mechanism for versioning and incremental updates of libraries, without breaking backward compatibility. 

An `inline` namespace can be used to provide an updated version of a library's interface, while still allowing old code to use the previous version. By using an `inline` namespace, the new version of the library can be introduced without breaking the existing code that depends on the old version.

Here is an example of how an inline namespace can be used:

```cpp
#include <iostream>

/*
// Initial version of the library
namespace MyLib {
    void foo() {
        std::cout << "Hello, world!" << std::endl;
    }
}
*/

// Updated library: v1 stays the default through an inline namespace; v2 is opt-in
namespace MyLib {
    inline namespace v1 {
        void foo() {
            std::cout << "Hello, World!" << std::endl;
        }
    }
    
    namespace v2 {
        void foo() {
            std::cout << "Hello, C++11!" << std::endl;
        }
    }
}

// Usage of the library
int main() {
    MyLib::foo();     // calls v1::foo (the inline, default version)
    MyLib::v2::foo(); // calls the new version explicitly
    return 0;
}
```

This code demonstrates how backward compatibility is maintained in a library called `MyLib`, which defines two versions of a function named `foo()`. The output of the program will be:

```
Hello, World!
Hello, C++11!
```

Here `v1` is kept inline so that existing callers of `MyLib::foo()` keep the old behavior. When a library wants the *newest* version to become the default instead, it moves `inline` to that namespace (e.g., `inline namespace v2`), and old code can still reach the previous version explicitly as `MyLib::v1::foo()`.
