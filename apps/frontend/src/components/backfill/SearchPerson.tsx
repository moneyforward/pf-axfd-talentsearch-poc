import {
    Combobox,
    HStack,
    Portal,
    Span,
    Spinner,
    useListCollection,
    VStack
} from "@chakra-ui/react";
import type { components } from "@mfskillsearch/typespec";
import ApiClientContext, { REFRESHED } from "../../lib/ApiClient";
import {
    useContext,
    useState
} from "react";
import { useAsync } from "react-use";

interface SearchPersonProps {
    setPerson: (person: components["schemas"]["PFSkillSearch.Models.Person"]) => void;
}

const SearchPerson = ({ setPerson }: SearchPersonProps) => {
    const apiClient = useContext(ApiClientContext);
    const [searchTerm, setSearchTerm] = useState("");
    const { collection, set } = useListCollection<components["schemas"]["PFSkillSearch.Models.MatchingResult"]>({
        initialItems: [],
        itemToString: (item) => item.person.employee_name,
        itemToValue: (item) => item.person.employee_id,
    });
    const [people, setPeople] = useState<components["schemas"]["PFSkillSearch.Models.MatchingResult"][]>([]);
    const state = useAsync(async () => {
        if (!searchTerm) {
            set([]);
            return;
        }

        await apiClient.person.search(searchTerm)
            .then((result) => {
                if (result === REFRESHED) {
                    return;
                } else {
                    console.log("SearchPerson result:", result);
                    if (Array.isArray(result)) {
                        set(result);
                        setPeople(result);
                    }
                }
            })
            .catch((error) => {
                console.error("Error fetching person data:", error);
            });
    }, [searchTerm, set]);

    return (
        <VStack
            width="100%"
            marginBottom={"12px"}
        >
            <Combobox.Root
                collection={collection}
                placeholder="名前やメールアドレスで検索できます。"
                onInputValueChange={(e) => setSearchTerm(e.inputValue)}
                positioning={{ sameWidth: true, placement: "bottom-start" }}
                onSelect={(item => {
                    if (item) {
                        console.log("Selected item:", item);
                        const found = people.find(
                            (i) => (i.person.employee_id === item.itemValue)
                        );
                        if (found) {
                            setPerson(found.person);
                        }
                    }
                })}
            >
                <Combobox.Control>
                    <Combobox.Input
                        placeholder="名前、メールアドレスで検索"
                    />
                    <Combobox.IndicatorGroup>
                        <Combobox.ClearTrigger />
                        <Combobox.Trigger />
                    </Combobox.IndicatorGroup>
                </Combobox.Control>
                <Portal>
                    <Combobox.Positioner>
                        <Combobox.Content minW="sw">
                            {state.loading ? (
                                <HStack p="2">
                                    <Spinner size="xs" borderWidth="1px" />
                                    <span>検索中...</span>
                                </HStack>
                            ) : state.error ? (
                                <Span p="2" color="fg.error">
                                    エラーが発生しました {state.error.message}
                                </Span>
                            ) : (
                                collection.items?.map((item) => (
                                    <Combobox.Item key={item.person.employee_id} item={item}>
                                        <HStack justify="space-between" textStyle="sm">
                                            <Span fontWeight="medium" truncate>
                                                {item.person.employee_name}
                                            </Span>
                                            <Span color="fg.muted" truncate>
                                                {[
                                                    item.person.dept_1,
                                                    item.person.dept_2,
                                                    item.person.dept_3,
                                                    item.person.dept_4,
                                                    item.person.dept_5,
                                                    item.person.dept_6
                                                ].filter((d) => {
                                                    return d && d.length > 0;
                                                }).join(" / ")}
                                            </Span>
                                        </HStack>
                                        <Combobox.ItemIndicator />
                                    </Combobox.Item>
                                ))
                            )}
                        </Combobox.Content>
                    </Combobox.Positioner>
                </Portal>

            </Combobox.Root>
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
        </VStack >
    );
}

export default SearchPerson;