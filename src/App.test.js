// test('renders learn react link', () => {
//   render(<App />);
//   const linkElement = screen.getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });


test('destructuring', () => {
    const name = 't'
    const test = ({[name]: t, ...rest}) => ({...rest, [name]: {}})
    // eslint-disable-next-line jest/valid-title
    const actual = test({a: 1, t: 2})
    console.log(actual)
    expect(actual).toEqual({a: 1, t: {}})
})
