import {
    createListCollection,
    Portal,
    Select,
    VStack
} from "@chakra-ui/react";
import type { components } from "@mfskillsearch/typespec";
import ApiClientContext, { REFRESHED } from "../../lib/ApiClient";
import { useContext, useMemo, useState } from "react";

interface SearchPersonProps {
    setPerson: (person: components["schemas"]["PFSkillSearch.Models.Person"]) => void;
}

const SearchPerson = ({ setPerson }: SearchPersonProps) => {
    const [people, setPeople] = useState<components["schemas"]["PFSkillSearch.Models.Person"][]>([]);
    const apiClient = useContext(ApiClientContext);
    const [searchTerm, setSearchTerm] = useState("");

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        console.log("Searching for person:", inputValue);
        apiClient.person.search(inputValue)
            .then((result) => {
                if (result === REFRESHED) {
                    return;
                }
                setPeople(result);

            }).then(() => {
            });
    }

    const collection = useMemo(() => {
        return createListCollection({
            items: people,
            itemToString: (item) => `${item.employee_name} (${item.mail})`,
            itemToValue: (item) => item.employee_id,
        });
    }, [people]);

    return (
        <VStack>
            <Select.Root
                collection={collection}
                onSelect={(item) => {
                    console.log("Selected person:", item);
                    const person = item.value as unknown as components["schemas"]["PFSkillSearch.Models.Person"];
                    setPerson(person);
                }}
            >
                <Select.HiddenSelect />
                <Select.Label>人物を検索</Select.Label>
                <Select.Control>
                    <Select.Trigger>
                        <Select.ValueText
                            inputMode="search"
                            placeholder="名前を入力してください。"
                        />
                    </Select.Trigger>
                    <Select.IndicatorGroup>

                    </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                    <Select.Positioner>
                        <Select.Content>
                            {collection.items.map((person) => {
                                return (
                                    <Select.Item
                                        item={person} key={person.employee_id}
                                    >
                                        {`${person.employee_name} (${person.mail})`}
                                        <Select.ItemIndicator />
                                    </Select.Item>
                                );
                            })}
                        </Select.Content>
                    </Select.Positioner>
                </Portal>
            </Select.Root>
            {/* <Input
                placeholder="名前を入力してください。"
                bg="#fff"
                borderColor="#ccc"
                borderRadius="3px"
                h="40px"
                fontSize="14px"
                color="#919191"
                fontFamily="'Noto Sans JP', sans-serif"
                onChange={handleInputChange}
            /> */}
        </VStack>
    );
}

export default SearchPerson;