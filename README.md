# iTan

iTan is a cli app to manage your iTan List fully encrypted.

  - Add List as JSON File or with assistent
  - AES-256 encrypted stored

### Commands

To get a Tan number just use the root command and a tan id.

For Example:
```
itan 45
Please enter your password: ******
> 45:23413
```

##### addlist
Options:
- -a --assistent
    *Get an assistent who asks for every Tan until you finished the whole list.*
- -f --file
    *Provide a JSON file with your Tan codes for import*
    ```
    {
        id:tan,
        //For example:
        00:12345
    }
    ```

##### reset
Resets all used attributes so you can get an already used Tan again.

### Development

Want to contribute? Great!
Any PR's are welcome.

### Todo's

 - Write Tests
 - Add -c --copy command to copy a tan to your clipboard

License
----
MIT
