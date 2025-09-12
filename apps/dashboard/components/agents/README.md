# Agent Playground

The Agent Playground is a comprehensive testing environment for agents that allows admins to test agent responses, actions, and widget styles in real-time.

## Features

### 1. Chat Testing

- **Real-time Chat Interface**: Send messages to test how your agent responds
- **Resource Integration**: Test with specific resources or all available resources
- **Context Selection**: Choose from different test contexts (DeFi, Portfolio, General Web3)
- **Beast Mode**: Toggle advanced AI capabilities for testing
- **Template Messages**: Generate predefined test messages for quick testing

### 2. Widget Testing

- **Growly Button**: Test interactive buttons with custom trigger messages
- **Growly Div**: Test div interactions and hover effects
- **Theme Customization**: Switch between different visual themes
- **Display Mode**: Test panel vs full view modes

### 3. Configuration

- **Agent Settings**: View current agent configuration
- **Resource Management**: See attached resources and their types
- **Status Monitoring**: Check agent status and model information

## Usage

### Accessing the Playground

1. Navigate to the Agents section in the dashboard
2. Select an agent to edit
3. Click on the "Playground" tab

### Testing Agent Responses

1. **Configure Test Settings**:

   - Select resources to include in testing
   - Choose test context
   - Enable/disable Beast Mode

2. **Send Test Messages**:

   - Type a message in the chat input
   - Press Enter or click Send
   - View agent responses and tool outputs

3. **Use Template Messages**:
   - Click "Generate Template" for predefined test messages
   - Customize templates as needed

### Testing Widgets

1. **Switch to Widget Tab**:

   - Configure theme and display settings
   - Test interactive components
   - Monitor event triggers

2. **Customize Appearance**:
   - Select from available themes
   - Adjust display modes
   - Test responsive behavior

## Integration

### Backend Integration

The playground integrates with the existing chat service:

- Uses the same LLM backend as production
- Supports all agent tools and capabilities
- Maintains conversation context during testing

### Suite Components

Reuses components from the `@getgrowly/suite` package:

- Chat widgets for testing
- Interactive components (GrowlyButton, GrowlyDiv)
- Theme and styling systems

## Technical Details

### Architecture

- **Frontend**: React with TypeScript
- **State Management**: Local state with React hooks
- **API Integration**: Chat service via HTTP requests
- **Component Loading**: Dynamic imports for SSR compatibility

### Data Flow

1. User input → Chat service → LLM backend
2. Agent response → Message display → Tool output
3. Widget events → Event logging → UI updates

### Error Handling

- Network errors are caught and displayed
- Invalid responses are logged
- User-friendly error messages

## Best Practices

### Testing Scenarios

1. **Basic Functionality**: Test simple queries and responses
2. **Resource Integration**: Verify agent can access attached resources
3. **Tool Usage**: Test agent's ability to use available tools
4. **Edge Cases**: Test with unusual inputs and error conditions

### Performance Considerations

- Clear chat history regularly for long testing sessions
- Monitor response times and agent performance
- Test with various resource combinations

## Troubleshooting

### Common Issues

1. **Agent Not Responding**: Check agent status and backend connectivity
2. **Resource Errors**: Verify resource attachments and permissions
3. **Widget Issues**: Check suite component imports and dependencies

### Debug Information

- Console logs for detailed error information
- Network tab for API request/response details
- Component state for debugging UI issues

## Future Enhancements

### Planned Features

- **Conversation Export**: Save test conversations for analysis
- **Performance Metrics**: Track response times and success rates
- **A/B Testing**: Compare different agent configurations
- **Integration Testing**: Test with external services and APIs

### Customization Options

- **Custom Test Scenarios**: Create and save test workflows
- **Advanced Widget Testing**: More comprehensive component testing
- **Theme Builder**: Custom theme creation and testing
