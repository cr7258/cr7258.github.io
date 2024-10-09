package stack_and_queue

func isValid(s string) bool {
	dic := map[rune]rune{
		'(': ')',
		'{': '}',
		'[': ']',
	}
	// 通过在栈中插入一个任意初始值（如 'x'），可以避免在检查和弹出栈顶元素时需要额外的边界检查。
	// 例如，使用这个初始值时，可以在后续逻辑中直接执行 stack[len(stack)-1]，而不需要担心栈是否为空。
	stack := []rune{'x'}

	for _, c := range s {
		// 左侧括号直接压入栈
		if _, ok := dic[c]; ok {
			stack = append(stack, c)
			// 当遇到右侧括号时，和栈顶元素进行比较
		} else {
			if dic[stack[len(stack)-1]] != c {
				return false
			}
			stack = stack[:len(stack)-1]
		}
	}
	return len(stack) == 1
}
