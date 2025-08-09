#include <iostream>
#include <string>
#include <vector>
using namespace std;

// 1. 基础数据类型演示
void basicTypesDemo() {
    cout << "\n=== Basic Data Types Demo ===" << endl;
    
    // 整型
    int number = 42;
    long bigNumber = 123456789L;
    
    // 浮点型
    float pi = 3.14f;
    double precise_pi = 3.14159265359;
    
    // 字符和布尔
    char letter = 'A';
    bool isTrue = true;
    
    cout << "Integer: " << number << endl;
    cout << "Long: " << bigNumber << endl;
    cout << "Float PI: " << pi << endl;
    cout << "Double PI: " << precise_pi << endl;
    cout << "Char: " << letter << endl;
    cout << "Bool: " << isTrue << endl;
}

// 2. 运算符演示
void operatorsDemo() {
    cout << "\n=== Operators Demo ===" << endl;
    
    int a = 10, b = 20;
    
    // 算术运算符
    cout << "Arithmetic Operators:" << endl;
    cout << "a + b = " << (a + b) << endl;
    cout << "a - b = " << (a - b) << endl;
    cout << "a * b = " << (a * b) << endl;
    cout << "b / a = " << (b / a) << endl;
    
    // 比较运算符
    cout << "\nComparison Operators:" << endl;
    cout << "a > b: " << (a > b) << endl;
    cout << "a < b: " << (a < b) << endl;
    cout << "a == b: " << (a == b) << endl;
}

// 3. 控制语句演示
void controlStatementsDemo() {
    cout << "\n=== Control Statements Demo ===" << endl;
    
    // if-else
    int score = 85;
    cout << "If-else example:" << endl;
    if (score >= 90) {
        cout << "Grade: A" << endl;
    } else if (score >= 80) {
        cout << "Grade: B" << endl;
    } else {
        cout << "Grade: C" << endl;
    }
    
    // for 循环
    cout << "\nFor loop example:" << endl;
    for (int i = 0; i < 3; i++) {
        cout << "Iteration " << i << endl;
    }
    
    // while 循环
    cout << "\nWhile loop example:" << endl;
    int count = 0;
    while (count < 3) {
        cout << "Count: " << count << endl;
        count++;
    }
    
    // switch
    cout << "\nSwitch example:" << endl;
    int choice = 2;
    switch (choice) {
        case 1: cout << "One" << endl; break;
        case 2: cout << "Two" << endl; break;
        default: cout << "Other" << endl;
    }
}

// 4. 数组演示
void arraysDemo() {
    cout << "\n=== Arrays Demo ===" << endl;
    
    // 普通数组
    int arr[3] = {1, 2, 3};
    cout << "Array elements: ";
    for (int i = 0; i < 3; i++) {
        cout << arr[i] << " ";
    }
    cout << endl;
}

// 5. 简单类演示
class Calculator {
private:
    int value;
    
public:
    Calculator() : value(0) {}
    
    void add(int x) {
        value += x;
    }
    
    int getValue() {
        return value;
    }
};

void classDemo() {
    cout << "\n=== Class Demo ===" << endl;
    
    Calculator calc;
    calc.add(5);
    calc.add(3);
    cout << "Calculator value: " << calc.getValue() << endl;
}

// 6. 简单模板演示
template<typename T>
T getMax(T a, T b) {
    return (a > b) ? a : b;
}

void templateDemo() {
    cout << "\n=== Template Demo ===" << endl;
    
    cout << "Max of 10 and 20: " << getMax(10, 20) << endl;
    cout << "Max of 3.14 and 2.72: " << getMax(3.14, 2.72) << endl;
}

// 主函数
int main() {
    cout << "C++ Features Demo Program" << endl;
    cout << "=========================" << endl;
    
    // 按顺序演示各种特性
    basicTypesDemo();
    operatorsDemo();
    controlStatementsDemo();
    arraysDemo();
    classDemo();
    templateDemo();
    
    return 0;
}