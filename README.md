
# Auto Temp Cleaner

<p align="center">
	<img width="120" height="120" alt="auto-temp-cleaner-icon" src="https://github.com/user-attachments/assets/0f9bebd3-592e-4b98-bb45-7ac3f4790c1d" />
</p>


Auto Temp Cleaner is an Obsidian plugin that automatically deletes files in the temporary folder that have exceeded their lifetime.

This plugin was created for the purpose of deleting notes that have lost their freshness, such as rough drafts.

## How to use?

1. Install via BART. (Once validation is complete, you will be able to install from the community plugin.)
1. Please configure the following items.

| Name                                 | Description                                                         |
| ------------------------------------ | ------------------------------------------------------------------- |
| Target folder                        | Enter the relative path of the folder to be deleted from the Vault. |
| File expiration time (minutes)       | How many minutes after creation should files be deleted?            |
| Cleaner execution interval (minutes) | How often should the Cleaner be run? (0-1440) *0 means stop         |

3. Turn on “Confirm automatic deletion".

After that, the contents of the temporary folder will be automatically deleted at regular intervals.

You can also initialize by pressing the "Initialize settings" button.

## License and Attribution

This project does not use code from any source other than the template. 

We follow the template's license.
